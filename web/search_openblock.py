from pathlib import Path
text = Path('openblock-gui.js').read_text(errors='ignore')
patterns = [
    'window["GUI"]',
    'window.GUI',
    'window["OpenBlock"]',
    'window.OpenBlock',
    'root["GUI"]',
    'root.GUI',
    'module.exports',
    'export default',
    'createEditor',
    'loadProject',
    'saveProject',
    'loadExtensions',
    'loadToolbox',
    'exportArduino',
    'OpenBlock',
    'GUI',
    'ScratchGui',
]
for p in patterns:
    print(f'{p}: {text.find(p)}')
print('---')
print(text[:500])
