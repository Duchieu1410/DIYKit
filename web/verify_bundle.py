from pathlib import Path
text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')
print('First 400 chars:')
print(text[:400])
print()
print('---')
for kw in ['root["GUI"]', 'AppStateHOC', 'containers_gui', 'default']:
    idx = text.find(kw)
    print(f'{kw}: {idx}')
