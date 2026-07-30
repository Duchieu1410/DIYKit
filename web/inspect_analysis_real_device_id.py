from pathlib import Path

text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')

idx = text.find('function analysisRealDeviceId')
if idx != -1:
    print('=== analysisRealDeviceId ===')
    print(text[idx:idx+1000])

idx2 = text.find('var deviceData = [')
if idx2 != -1:
    print('=== deviceData array ===')
    print(text[idx2:idx2+2000])
