from pathlib import Path
text = Path('openblock-gui.js').read_text(encoding='utf-16', errors='ignore')
search_terms = [
    '/static/',
    'static/',
    'chunks/',
    'editor.worker.js',
    'extension-worker.js',
    'openblock-gui.js',
    'worker.js',
    'webpackJsonpGUI',
    'window["react"]',
    'window["react-dom"]',
]
for term in search_terms:
    idx = text.find(term)
    print(term, idx)
    if idx != -1:
        start = max(0, idx - 80)
        end = min(len(text), idx + 160)
        print(text[start:end].replace('\n', ' '))
        print('---')
