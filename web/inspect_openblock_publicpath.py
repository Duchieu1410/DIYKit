from pathlib import Path
text = Path('openblock-gui.js').read_text(encoding='utf-16', errors='ignore')
for pat in ['__webpack_require__.p', 'jsonpScriptSrc', 'chunks/', 'script.src', 'publicPath', 'document.createElement("script")', 'document.createElement(\'script\')', 'window["react"]', 'window["react-dom"]']:
    idx = text.find(pat)
    print(f'{pat}: {idx}')
    if idx != -1:
        start = max(0, idx - 200)
        end = min(len(text), idx + 400)
        print(text[start:end].replace('\n', ' '))
        print('---')
