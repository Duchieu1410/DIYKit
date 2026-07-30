from pathlib import Path
import json, tarfile

# 1. Find webpack publicPath in the converted bundle
text = Path('static/openblock/openblock-gui.js').read_text(encoding='utf-8')

idx = text.find('__webpack_require__.p')
if idx != -1:
    print('=== publicPath definition ===')
    print(text[max(0,idx-30):idx+300])
else:
    print('__webpack_require__.p not found directly')

# Also look for any hard-coded public path strings
for pat in ['publicPath', '/static/', '/chunks/', '/openblock', 'p+\"', "p + \"", 'p+"', "p + '"]:
    i = text.find(pat)
    if i != -1:
        print(f'\n=== {pat!r} at {i} ===')
        print(text[max(0,i-80):i+200])

# 2. List tarball dist/ contents
print('\n\n=== TARBALL dist/ contents ===')
with tarfile.open('openblock-gui.tgz', 'r:gz') as tar:
    dist_entries = [n for n in tar.getnames() if '/dist/' in n]
    print(f'Total dist/ entries: {len(dist_entries)}')
    for e in dist_entries[:60]:
        print(' ', e)
