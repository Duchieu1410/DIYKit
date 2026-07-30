from pathlib import Path

text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')

# Check if thingBot is already in the bundle as a built-in
for pat in ['thingBot', 'thingbot', 'ThingBot', 'esp32C3', 'esp32c3']:
    idx = text.find(pat)
    if idx != -1:
        ctx = text[max(0, idx-100):idx+200].replace('\n', ' ')
        print(f'=== {pat!r} at {idx} ===')
        print(ctx[:300])
        print()

# Also find the full getDeviceList / filter logic
idx2 = text.find('filteredDevices')
if idx2 != -1:
    ctx = text[max(0,idx2-50):idx2+1000].replace('\n',' ')
    print(f'\n=== filteredDevices (filter logic) ===')
    print(ctx[:900])
