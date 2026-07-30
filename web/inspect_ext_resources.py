from pathlib import Path

text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')

# Search for how external resources / devices are loaded
patterns = [
    'externalResource',
    'external_resource',
    'ExternalResource',
    'loadDevices',
    'deviceList',
    'device_list',
    '/devices',
    'openblock-resource',
    'resourceServer',
    'linkServer',
    'openblockLink',
    'OpenBlockLink',
    '/api/device',
    'formatExternalResource',
    'externalDevices',
    'getDeviceList',
    'external-resources',
]

for pat in patterns:
    idx = text.find(pat)
    if idx != -1:
        ctx = text[max(0, idx-150):idx+350].replace('\r\n',' ').replace('\n',' ')
        print(f'\n=== {pat!r} at {idx} ===')
        print(ctx[:400])
