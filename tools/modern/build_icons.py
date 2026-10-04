# -*- coding: utf-8 -*-
"""모던 테마(assets/modern.css)용 선 아이콘 묶음 만들기.
  python3 tools/modern/build_icons.py /path/to/lucide-static/icons
→ assets/modern-icons.svg (symbol 묶음, id = i-<이름>) + assets/modern-icons.json(이모지 → 아이콘 이름, modern.js 에 같은 표가 들어 있음)
아이콘: Lucide(ISC 라이선스, https://lucide.dev) — 선 굵기·색은 CSS(.mi)가 정함."""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
# 이모지 → Lucide 아이콘 이름(화면 틀에서만 바꿈 — 기사 본문·댓글 글자는 손대지 않음)
EMOJI = {
    "📍": "map-pin", "❤️": "heart", "🤍": "heart", "♡": "heart", "⭐": "star", "★": "star", "🧩": "sliders-horizontal",
    "💅": "sparkles", "🐶": "dog", "🍜": "utensils", "🏍️": "motorbike", "💆": "hand-heart", "💇": "scissors", "💈": "scissors",
    "🛒": "shopping-cart", "🚨": "siren", "🌦️": "cloud-sun-rain", "🛂": "id-card", "🏖️": "tree-palm", "🏝️": "tree-palm",
    "📰": "newspaper", "🏙️": "building-2", "⛰️": "mountain", "⛰": "mountain", "🏛️": "landmark", "💬": "message-circle",
    "📢": "megaphone", "🗣️": "megaphone", "📞": "phone", "📅": "calendar", "🗓️": "calendar-days", "🙋": "user-round",
    "💡": "lightbulb", "↗": "arrow-up-right", "🙌": "thumbs-up", "🙅": "thumbs-down", "👍": "thumbs-up", "👎": "thumbs-down",
    "🆕": "sparkle", "📌": "pin", "📇": "store", "🏪": "store", "🕰️": "history", "✈️": "plane", "✈": "plane", "☕": "coffee",
    "🟢": "dot", "🟠": "dot", "⚪": "dot", "⬜": "square", "💰": "banknote", "🧾": "receipt", "🕒": "clock", "✅": "circle-check",
    "🗺️": "map", "✋": "flag", "🔎": "search", "🔍": "search", "💱": "arrow-left-right", "🚗": "car", "🌧️": "cloud-rain",
    "⚠️": "triangle-alert", "🏠": "house", "🏘️": "house", "💼": "briefcase", "🧳": "luggage", "👤": "user", "🧑": "user",
    "🎯": "target", "🏆": "trophy", "📊": "chart-column", "🛡️": "shield", "🔒": "lock", "🔗": "link", "📷": "camera",
    "📲": "smartphone", "📋": "clipboard-list", "📄": "file-text", "🗂️": "folder", "😷": "wind", "🙂": "smile", "🙈": "eye-off",
    "👋": "hand", "✍️": "pen-line", "✏️": "pencil", "➕": "plus", "🌡️": "thermometer", "☀️": "sun", "☀": "sun",
    "🌤️": "cloud-sun", "⛅": "cloud-sun", "☁️": "cloud", "⛈️": "cloud-lightning", "❄️": "snowflake", "🌨️": "snowflake",
    "🌫️": "cloud-fog", "🌙": "moon", "☔": "umbrella", "☂": "umbrella", "⛽": "fuel", "⚓": "anchor", "📡": "radio-tower",
    "🧪": "flask-conical", "📐": "ruler", "✕": "x", "⏸️": "pause", "↺": "rotate-ccw",
}
EXTRA = ["chevron-down", "chevron-right", "menu", "x"]


def main():
    src = pathlib.Path(sys.argv[1])
    names = sorted(set(EMOJI.values()) | set(EXTRA))
    out = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none">',
           '<!-- Lucide icons (ISC License, https://lucide.dev) — tools/modern/build_icons.py 가 만듦 -->']
    for n in names:
        if n == "dot":   # 영업 상태 동그라미(채움)
            out.append('<symbol id="i-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/></symbol>')
            continue
        s = (src / (n + ".svg")).read_text(encoding="utf-8")
        body = re.sub(r"(?s)^.*?<svg[^>]*>|</svg>\s*$", "", s).strip()
        body = re.sub(r"\s*\n\s*", "", body)
        out.append('<symbol id="i-%s" viewBox="0 0 24 24">%s</symbol>' % (n, body))
    out.append("</svg>")
    (ROOT / "assets/modern-icons.svg").write_text("\n".join(out) + "\n", encoding="utf-8")
    print("icons:", len(names), "bytes:", len("\n".join(out)))
    print(json.dumps(EMOJI, ensure_ascii=False))


if __name__ == "__main__":
    main()
