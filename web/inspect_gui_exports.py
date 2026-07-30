from pathlib import Path
text = Path('openblock-gui.js').read_text(encoding='utf-16', errors='ignore')

keywords = [
    'ScratchGui',
    'AppStateHOC',
    'appMount',
    'app-mount',
    'scratch-gui',
    'renderGui',
    'mountGui',
    'exports["default"]',
    '__webpack_exports__["default"]',
    'GUI.default',
    'intlInitialState',
    'openblock',
    'OpenBlock',
]

for kw in keywords:
    idx = text.find(kw)
    if idx != -1:
        print(f'\n=== {kw} at {idx} ===')
        ctx = text[max(0, idx - 150):idx + 350]
        print(ctx.replace('\r\n', ' ').replace('\n', ' '))
