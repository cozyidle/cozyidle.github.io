"""Builds one page per game from tools/game_template.html and assets/games.js.

Run after changing a game in games.js:  python tools/build.py
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "assets" / "games.js").read_text(encoding="utf-8")
body = src[src.index("["): src.rindex("]") + 1]
# games.js is plain JS; make it valid JSON (quote keys, drop trailing commas, strip comments).
body = re.sub(r"//.*", "", body)
body = re.sub(r"(\w+):", r'"\1":', body)
body = re.sub(r",(\s*[}\]])", r"\1", body)
games = json.loads(body)

template = (ROOT / "tools" / "game_template.html").read_text(encoding="utf-8")
for g in games:
    html = template
    for key in ("slug", "name", "tagline", "color", "color2"):
        html = html.replace("{{" + key + "}}", g[key])
    out = ROOT / g["slug"] / "index.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print("built", out.relative_to(ROOT))
