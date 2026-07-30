from pathlib import Path
import re

text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')

# Find all deviceId entries in deviceData array
matches = re.findall(r"deviceId:\s*['\"]([^'\"]+)['\"]", text)
print("DeviceIds found in bundle:", matches[:50])
