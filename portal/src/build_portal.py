"""Build the CUHK GamePlay teacher portal as the site's main page (index.html).

Run from anywhere:  python3 portal/src/build_portal.py
Inputs : engine/, shells/, games/catalog.json, games/*/world.json + game.json, portal/covers/*.jpg, portal/src/*
Outputs: index.html (the portal) and portal/index.html (a redirect to it).
"""
import base64, importlib.util, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = Path(__file__).resolve().parent
rd = lambda p: (ROOT / p).read_text(encoding='utf-8')

spec = importlib.util.spec_from_file_location('b', ROOT / 'build' / 'build.py')
b = importlib.util.module_from_spec(spec); spec.loader.exec_module(b)

SRC = {
    'engine': rd('engine/engine.js'),
    'modes': {'rpg': rd('engine/rpg.js'), 'carry2': rd('engine/carry2.js'), 'dialogue': rd('engine/dialogue.js')},
    'kits': {'kit_ancient': rd('engine/kit_ancient.js'), 'kit_campus': rd('engine/kit_campus.js'), 'kit_hk': rd('engine/kit_hk.js'), 'kit_world': rd('engine/kit_world.js'), 'kit_mix': rd('engine/kit_mix.js')},
    'shells': {'rpg': rd('shells/rpg_shell.html'), 'carry': rd('shells/carry_shell.html'), 'dialogue': rd('shells/dialogue_shell.html')},
    'icons': b.ICONS,
    'templates': {'carry_world': json.loads(rd('games/lunyu/world.json')),
                  'dialogue_world': json.loads(rd('games/hkbuddy/world.json')),
                  'dialogue_game': json.loads(rd('games/hkbuddy/game.json'))},
}

def cover(path):
    p = ROOT / 'portal' / 'covers' / (path.strip('/').split('/')[-1] + '.jpg')
    return 'data:image/jpeg;base64,' + base64.b64encode(p.read_bytes()).decode() if p.exists() else ''

DEMOS = [dict(e, cover=cover(e['path'])) for e in json.loads(rd('games/catalog.json'))]

J = lambda o: json.dumps(o, ensure_ascii=False).replace('<', '\\u003c')
page = (SRC_DIR / 'portal_shell.html').read_text(encoding='utf-8')
page = page.replace('%%SRC%%', J(SRC)).replace('%%DEMOS%%', J(DEMOS)).replace('%%APP%%', (SRC_DIR / 'portal_app.js').read_text(encoding='utf-8'))
(ROOT / 'index.html').write_text(page, encoding='utf-8')
(ROOT / 'portal' / 'index.html').write_text('<!DOCTYPE html><meta charset="utf-8"><title>CUHK GamePlay</title><meta http-equiv="refresh" content="0; url=../"><a href="../">CUHK GamePlay</a>\n', encoding='utf-8')
print('index.html (portal)', len(page) // 1024, 'KB |', len(DEMOS), 'demo games |', sum(1 for d in DEMOS if d['cover']), 'covers')
