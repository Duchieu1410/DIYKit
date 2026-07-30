from pathlib import Path

text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')

idx = text.find('var makeDeviceLibrary = function')
if idx != -1:
    print('=== makeDeviceLibrary function ===')
    print(text[idx:idx+3500])
