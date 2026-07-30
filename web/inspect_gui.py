from pathlib import Path
import json, tarfile

with tarfile.open('openblock-gui.tgz', 'r:gz') as tar:
    package_json = tar.extractfile('package/package.json')
    package_data = json.load(package_json)
    print('package.main=', package_data.get('main'))
    print('package.browser=', package_data.get('browser'))
    print('package.exports=', package_data.get('exports'))
    if 'package/main/scratch-gui.js' in tar.getnames():
        f = tar.extractfile('package/main/scratch-gui.js')
        content = f.read().decode('utf-8', errors='ignore')
        print('scratch-gui.js head:', content[:500])

for fname in ['openblock-gui.js']:
    raw = Path(fname).read_bytes()
    for enc in ['utf-16', 'utf-16-le', 'utf-16-be', 'utf-8', 'latin-1']:
        try:
            decoded = raw.decode(enc)
            if 'webpackUniversalModuleDefinition' in decoded[:2000]:
                print(f'file {fname} decoded as {enc}')
                print(decoded[:500])
                break
        except Exception:
            pass

print('done')
