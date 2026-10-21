#!/usr/bin/env python3
"""把每款遊戲的設定檔、共用引擎、場景套件和玩法模組，內嵌成單一 HTML。

用法：
    python3 build/build.py            # 建置全部遊戲
    python3 build/build.py chibi shop # 只建置指定遊戲
輸出：games/<遊戲>/index.html
"""
import json, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
GAMES = {
    # 遊戲資料夾: 頁面外殼, 玩法模組, 場景套件
    "fish":      ("rpg_shell.html",        "rpg.js",       "kit_ancient.js"),
    "lunyu":     ("carry_shell.html",      "carry2.js",    "kit_ancient.js"),
    "xiaoyao":   ("rpg_shell.html",        "rpg.js",       "kit_ancient.js"),
    "labsafety": ("rpg_shell.html",        "rpg.js",       "kit_campus.js"),
    "floatsink": ("sim_shell.html",        "sim.js",       "kit_campus.js"),
    "xishan":    ("explore_shell.html",    "explore.js",   "kit_ancient.js"),
    "chibi":     ("detective_shell.html",  "detective.js", None),
    "shop":      ("manage_shell.html",     "manage.js",    None),
    "hkbuddy":   ("dialogue_shell.html",   "dialogue.js",  "kit_hk.js"),
    "site":      ("building_shell.html",   "building.js",  "kit_site.js"),
    "shanju":    ("rhythm_shell.html",     "rhythm.js",    "kit_ancient.js"),
    "river":     ("fieldtrip_shell.html",  "fieldtrip.js", None),
    "coding":    ("coding_shell.html",     "coding.js",    None),
    "factcheck": ("factcheck_shell.html",  "factcheck.js", "kit_hk.js"),
    "maiyou":    ("match_shell.html",      "matchgame.js", "kit_ancient.js"),
    "aitrain":   ("aitrain_shell.html",    "aitrain.js",   "kit_world.js"),
}
ICONS = {
    "lantern": '<svg viewBox="0 0 40 52" aria-hidden="true"><rect x="15" y="1" width="10" height="5" rx="1" fill="#B9862A"/><rect x="9" y="6" width="22" height="4" rx="2" fill="#E0B04B"/><ellipse cx="20" cy="27" rx="15" ry="17" fill="#7A2A20"/><ellipse id="mGlow" cx="20" cy="27" rx="15" ry="17" fill="#FFB347" opacity=".5"/><rect x="9" y="43" width="22" height="4" rx="2" fill="#E0B04B"/></svg>',
    "flask": '<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M15 4 H25 V18 L35 42 C36.5 46 34 49 30 49 H10 C6 49 3.5 46 5 42 L15 18 Z" fill="#1E3A5A" stroke="#E0B04B" stroke-width="2" stroke-linejoin="round"/><path id="mGlow" d="M11.5 32 H28.5 L33 43 C33.6 44.6 32.6 46 31 46 H9 C7.4 46 6.4 44.6 7 43 Z" fill="#5FD0A0" opacity=".5"/><path d="M13 4 H27" stroke="#E0B04B" stroke-width="3" stroke-linecap="round"/></svg>',
    "shield": '<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M20 3 L36 9 V24 C36 36 29 44 20 49 C11 44 4 36 4 24 V9 Z" fill="#1E3A5A" stroke="#E0B04B" stroke-width="2"/><path id="mGlow" d="M20 8 L31 12.5 V24 C31 33 26 39.5 20 43.5 C14 39.5 9 33 9 24 V12.5 Z" fill="#5FD0A0" opacity=".5"/></svg>',
}

def js(path): return (ROOT / path).read_text(encoding="utf-8")

def build(name):
    shell, mode, kit = GAMES[name]
    d = ROOT / "games" / name
    s = (ROOT / "shells" / shell).read_text(encoding="utf-8")
    content = json.loads((d / "content.json").read_text(encoding="utf-8"))
    for key, f in (("CONTENT", "content.json"), ("WORLD", "world.json"), ("GAME", "game.json")):
        data = json.loads((d / f).read_text(encoding="utf-8"))
        s = s.replace("%%" + key + "%%", json.dumps(data, ensure_ascii=False).replace("</", "<\\/"))
    meta = content.get("meta", {})
    s = s.replace("%%TITLE%%", meta.get("short_title", meta.get("topic", name)))
    s = s.replace("%%ICON%%", ICONS.get(meta.get("meter", {}).get("icon", ""), ""))
    s = s.replace("%%ENGINE%%", js("engine/engine.js"))
    s = s.replace("<script>%%KIT%%</script>", "<script>" + js("engine/" + kit) + "</script>" if kit else "")
    if mode: s = s.replace("%%MODE%%", js("engine/" + mode))
    if "%%" in s:
        raise SystemExit(f"{name}: 仍有未替換的佔位符")
    (d / "index.html").write_text(s, encoding="utf-8")
    print(f"{name:10s} {len(s)//1024:4d} KB  -> games/{name}/index.html")

if __name__ == "__main__":
    for n in (sys.argv[1:] or GAMES): build(n)
