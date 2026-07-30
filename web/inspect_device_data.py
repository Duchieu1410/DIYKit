from pathlib import Path
import re

text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')

idx = text.find('var deviceData = [')
if idx != -1:
    idx_end = text.find('];', idx)
    print('=== Entire deviceData array ===')
    sub = text[idx:idx_end+2]
    # find all deviceId: '...'
    print(re.findall(r"deviceId:\s*['\"]([^'\"]+)['\"]", sub))
