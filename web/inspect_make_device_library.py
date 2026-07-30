from pathlib import Path

text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')

idx = text.find('makeDeviceLibrary')
if idx != -1:
    print('=== makeDeviceLibrary code ===')
    print(text[idx:idx+2500])
