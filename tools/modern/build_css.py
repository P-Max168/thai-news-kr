# -*- coding: utf-8 -*-
"""모던 테마 CSS 만들기: tools/modern/modern.src.css(선택자 앞에 아무것도 안 붙인 원본) → assets/modern.css
모든 선택자 앞에 'html.th-modern ' 을 붙여서, 스위치(index.html 의 TN_THEME)가 켜졌을 때만 적용되고
기존 style.css·late.css·nearby.css·dragon-ad.css 보다 우선하게 함. ':root' → 'html.th-modern'.
  python3 tools/modern/build_css.py"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
P = "html.th-modern"


def pre(sel):
    out = []
    for s in sel.split(","):
        s = s.strip()
        if not s:
            continue
        if s == ":root":
            out.append(P)
        elif s.startswith(":root"):
            out.append(P + s[5:])
        else:
            out.append(P + " " + s)
    return ",".join(out)


def walk(css):
    res, i = [], 0
    while i < len(css):
        j = css.find("{", i)
        if j < 0:
            break
        head = css[i:j].strip()
        if head.startswith("@media") or head.startswith("@supports") or head.startswith("@container"):
            depth, k = 1, j + 1
            while depth:
                if css[k] == "{": depth += 1
                elif css[k] == "}": depth -= 1
                k += 1
            res.append(head + "{" + walk(css[j + 1:k - 1]) + "}")
            i = k
            continue
        k = css.find("}", j)
        body = css[j + 1:k].strip()
        if head.startswith("@keyframes"):
            # 한 단계 더(프레임)
            depth, k = 1, j + 1
            while depth:
                if css[k] == "{": depth += 1
                elif css[k] == "}": depth -= 1
                k += 1
            res.append(css[i:k].strip()); i = k; continue
        res.append(pre(head) + "{" + body + "}")
        i = k + 1
    return "\n".join(res)


def main():
    src = (ROOT / "tools/modern/modern.src.css").read_text(encoding="utf-8")
    head = src.split("*/", 1)[0] + "*/\n"
    body = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    out = head + walk(body) + "\n"
    (ROOT / "assets/modern.css").write_text(out, encoding="utf-8")
    print("modern.css", len(out.encode()), "bytes")


if __name__ == "__main__":
    main()
