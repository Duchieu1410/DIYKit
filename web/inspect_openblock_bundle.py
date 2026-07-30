from pathlib import Path

path = Path('openblock-gui.js')
text = path.read_text(encoding='utf-16', errors='ignore')

patterns = [
    'root["GUI"]',
    'root.GUI',
    'window["GUI"]',
    'window.GUI',
    'module.exports',
    'exports["default"]',
    'exports.default',
    'require("react")',
    'require("react-dom")',
    'createEditor',
    'loadProject',
    'saveProject',
    'loadExtensions',
    'loadToolbox',
    'exportArduino',
    'OpenBlock',
    'ScratchGui',
]

for p in patterns:
    idx = text.find(p)
    print(f'{p}: {idx}')

print('\n=== createEditor context ===')
idx = text.find('createEditor')
if idx != -1:
    start = max(0, idx - 400)
    end = min(len(text), idx + 500)
    print(text[start:end])

print('\n=== loadProject context ===')
idx = text.find('loadProject')
if idx != -1:
    start = max(0, idx - 300)
    end = min(len(text), idx + 500)
    print(text[start:end])

print('\n=== saveProject context ===')
idx = text.find('saveProject')
if idx != -1:
    start = max(0, idx - 200)
    end = min(len(text), idx + 300)
    print(text[start:end])

print('\n=== first 200 chars ===')
print(text[:200])
