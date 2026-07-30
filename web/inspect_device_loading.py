from pathlib import Path

text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')

# Deep dive into getDeviceList and localResourcesServerUrl
patterns = [
    'localResourcesServerUrl',
    'getDeviceList',
    'makeDeviceLibrary',
    'thirdParty',
    'third_party',
    'third-party',
    'deviceData',
    'deviceLibrary',
]

for pat in patterns:
    idx = text.find(pat)
    if idx != -1:
        ctx = text[max(0, idx-200):idx+600].replace('\r\n',' ').replace('\n',' ')
        print(f'\n=== {pat!r} at {idx} ===')
        print(ctx[:700])
        print()
