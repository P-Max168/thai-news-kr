#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GPT lane guard (Max 2026-10-28).

Checks a work tree (usually a gpt/* branch checkout) against an allowlist and
schema. Intended to run from **main's copy** of this file (see gpt-lane.yml).

  python3 tools/gpt_lane_check.py --work /path/to/gpt-branch --base origin/main
  python3 tools/gpt_lane_check.py --work . --base HEAD~0   # local: changed vs index? use --diff-range

Exit 0 = ok to merge. Exit 1 = reject (do not merge).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ALLOWED_PREFIXES = (
    "ops/gpt/tags/",
    "ops/gpt/newsletter/",
    "ops/gpt/schema/",
    "ops/gpt/research/youtube/",
    "ops/gpt/research/marketing/",
)
ALLOWED_EXACT = {
    "ops/gpt/README.md",
    "ops/gpt/tags/README.md",
    "ops/gpt/newsletter/README.md",
    "ops/gpt/research/README.md",
    "ops/gpt/research/youtube/README.md",
    "ops/gpt/research/marketing/README.md",
}

DATE_FILE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}\.(json|md)$")
DATE_STEM_MD = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}_.+\.md$")  # research: YYYY-MM-DD_*.md
DATE_VAL = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")


def die(msg: str, code: int = 1) -> None:
    print(f"GPT_LANE_FAIL: {msg}", file=sys.stderr)
    sys.exit(code)


def ok(msg: str) -> None:
    print(f"GPT_LANE_OK: {msg}")


def run(cmd: list[str], cwd: Path) -> str:
    p = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True)
    if p.returncode != 0:
        die(f"cmd failed ({p.returncode}): {' '.join(cmd)}\n{p.stderr.strip()}")
    return p.stdout


def changed_files(work: Path, base_ref: str) -> list[str]:
    """Files changed on work HEAD vs merge-base with base_ref (name-only)."""
    # Ensure base exists
    run(["git", "rev-parse", "--verify", base_ref], work)
    mb = run(["git", "merge-base", base_ref, "HEAD"], work).strip()
    out = run(["git", "diff", "--name-only", f"{mb}...HEAD"], work)
    files = [ln.strip() for ln in out.splitlines() if ln.strip()]
    # Also catch renames/copies as path changes already listed; include untracked? no — GPT pushes commits
    return files


def path_allowed(path: str) -> bool:
    if path in ALLOWED_EXACT:
        return True
    return any(path.startswith(p) for p in ALLOWED_PREFIXES)


def load_schema(schema_path: Path) -> dict:
    if not schema_path.is_file():
        die(f"schema missing: {schema_path}")
    return json.loads(schema_path.read_text(encoding="utf-8"))


def validate_tags_obj(data: object, path: str) -> list[str]:
    """Hand-rolled check matching ops/gpt/schema/tags.schema.json (no extra deps)."""
    errs: list[str] = []
    if not isinstance(data, dict):
        return [f"{path}: root must be object"]
    if set(data.keys()) - {"date", "articles"}:
        errs.append(f"{path}: unexpected keys {sorted(set(data.keys()) - {'date', 'articles'})}")
    if "date" not in data or not isinstance(data["date"], str) or not DATE_VAL.match(data["date"]):
        errs.append(f"{path}: date must be YYYY-MM-DD string")
    arts = data.get("articles")
    if not isinstance(arts, list):
        errs.append(f"{path}: articles must be array")
        return errs
    for i, a in enumerate(arts):
        loc = f"{path}:articles[{i}]"
        if not isinstance(a, dict):
            errs.append(f"{loc}: must be object")
            continue
        extra = set(a.keys()) - {"id", "tags", "category", "related"}
        if extra:
            errs.append(f"{loc}: unexpected keys {sorted(extra)}")
        for req in ("id", "tags", "category"):
            if req not in a:
                errs.append(f"{loc}: missing {req}")
        if "id" in a and (not isinstance(a["id"], str) or not a["id"].strip()):
            errs.append(f"{loc}: id must be non-empty string")
        if "category" in a and (not isinstance(a["category"], str) or not a["category"].strip() or len(a["category"]) > 64):
            errs.append(f"{loc}: category must be 1..64 char string")
        if "tags" in a:
            if not isinstance(a["tags"], list) or len(a["tags"]) > 20:
                errs.append(f"{loc}: tags must be array len<=20")
            else:
                for j, t in enumerate(a["tags"]):
                    if not isinstance(t, str) or not t.strip():
                        errs.append(f"{loc}:tags[{j}] must be non-empty string")
        if "related" in a:
            if not isinstance(a["related"], list) or len(a["related"]) > 10:
                errs.append(f"{loc}: related must be array len<=10")
            else:
                for j, t in enumerate(a["related"]):
                    if not isinstance(t, str) or not t.strip():
                        errs.append(f"{loc}:related[{j}] must be non-empty string")
    return errs


def check_file_contents(work: Path, files: list[str], schema_hint: Path) -> None:
    _ = schema_hint  # documented; validation is hand-rolled to match schema
    errs: list[str] = []
    for rel in files:
        p = work / rel
        if not p.is_file():
            # deleted file under allowlist is ok (cleanup)
            if rel.startswith("ops/gpt/"):
                ok(f"deleted allowed path: {rel}")
                continue
            errs.append(f"missing file listed in diff: {rel}")
            continue
        if rel.startswith("ops/gpt/tags/") and rel.endswith(".json") and not rel.endswith("README.md"):
            name = Path(rel).name
            if name != "README.md" and not DATE_FILE.match(name):
                errs.append(f"{rel}: tags file must be YYYY-MM-DD.json")
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
            except json.JSONDecodeError as e:
                errs.append(f"{rel}: invalid JSON ({e})")
                continue
            errs.extend(validate_tags_obj(data, rel))
            # date in file should match filename when filename is dated
            if DATE_FILE.match(name) and isinstance(data, dict):
                want = name[:10]
                if data.get("date") != want:
                    errs.append(f"{rel}: date field {data.get('date')!r} != filename {want}")
        elif rel.startswith("ops/gpt/newsletter/") and rel.endswith(".md"):
            name = Path(rel).name
            if name != "README.md" and not DATE_FILE.match(name):
                errs.append(f"{rel}: newsletter file must be YYYY-MM-DD.md")
            text = p.read_text(encoding="utf-8", errors="replace")
            if len(text.encode("utf-8")) > 200_000:
                errs.append(f"{rel}: newsletter draft too large (>200KB)")
            # refuse obvious secret-looking lines
            for ln in text.splitlines():
                if re.search(r"(api[_-]?key|secret|password|token)\s*[:=]", ln, re.I):
                    errs.append(f"{rel}: looks like a secret assignment — remove it")
                    break
        elif rel.startswith("ops/gpt/research/youtube/") or rel.startswith("ops/gpt/research/marketing/"):
            name = Path(rel).name
            if name == "README.md":
                pass
            elif not name.endswith(".md") or not DATE_STEM_MD.match(name):
                errs.append(f"{rel}: research file must be markdown named YYYY-MM-DD_*.md")
            else:
                text = p.read_text(encoding="utf-8", errors="replace")
                if len(text.encode("utf-8")) > 400_000:
                    errs.append(f"{rel}: research markdown too large (>400KB)")
                for ln in text.splitlines():
                    if re.search(r"(api[_-]?key|secret|password|token)\s*[:=]", ln, re.I):
                        errs.append(f"{rel}: looks like a secret assignment — remove it")
                        break
        elif rel.startswith("ops/gpt/schema/") and rel.endswith(".json"):
            try:
                json.loads(p.read_text(encoding="utf-8"))
            except json.JSONDecodeError as e:
                errs.append(f"{rel}: invalid JSON ({e})")
        elif rel in ALLOWED_EXACT or rel.endswith("README.md"):
            pass
        else:
            # other under ops/gpt/schema or tags without matching pattern
            if not path_allowed(rel):
                errs.append(f"{rel}: not in allowlist")
    if errs:
        die("content validation failed:\n  - " + "\n  - ".join(errs))


def site_smoke(work: Path) -> None:
    """Light sanity: site still looks like a news site; ops/gpt not wired into UI."""
    index = work / "index.html"
    if not index.is_file():
        die("index.html missing in work tree")
    html = index.read_text(encoding="utf-8", errors="replace")
    if "ops/gpt" in html:
        die("index.html references ops/gpt — site must not render GPT lane yet")
    lang = work / "site" / "LANG"
    if not lang.is_file():
        die("site/LANG missing")
    # parse a couple of existing JSON data files if present (do not require specific edition)
    data_dir = work / "data"
    if data_dir.is_dir():
        checked = 0
        for jp in sorted(data_dir.glob("*.json"))[:5]:
            try:
                json.loads(jp.read_text(encoding="utf-8"))
            except json.JSONDecodeError as e:
                die(f"site data JSON broken: {jp.name}: {e}")
            checked += 1
        ok(f"smoke: index.html + site/LANG + {checked} data/*.json parse")
    else:
        ok("smoke: index.html + site/LANG (no data/)")


def main() -> None:
    ap = argparse.ArgumentParser(description="Validate a gpt/* branch for auto-merge")
    ap.add_argument("--work", required=True, help="Path to git work tree (gpt branch checkout)")
    ap.add_argument("--base", default="origin/main", help="Base ref to diff against (default origin/main)")
    ap.add_argument("--allow-empty", action="store_true", help="Allow zero file changes (no-op)")
    args = ap.parse_args()
    work = Path(args.work).resolve()
    if not (work / ".git").exists() and not (work / ".git").is_file():
        # worktree or plain — still need git
        if not (work / ".git").exists():
            # might be .git file for worktree
            die(f"not a git work tree: {work}")

    files = changed_files(work, args.base)
    if not files:
        if args.allow_empty:
            ok("no changes vs base")
            site_smoke(work)
            sys.exit(0)
        die("no changes vs base — nothing to merge")

    bad = [f for f in files if not path_allowed(f)]
    if bad:
        die(
            "path allowlist failed — only ops/gpt/tags|newsletter|schema|research/youtube|research/marketing (+README) allowed:\n  - "
            + "\n  - ".join(bad)
        )
    ok(f"path allowlist passed ({len(files)} files)")

    schema = work / "ops/gpt/schema/tags.schema.json"
    if not schema.is_file():
        # fall back to base tree schema via show? require present on branch after lane setup
        die("ops/gpt/schema/tags.schema.json missing on branch (merge main first)")

    check_file_contents(work, files, schema)
    ok("content/schema validation passed")
    site_smoke(work)
    ok("ready to merge")


if __name__ == "__main__":
    main()
