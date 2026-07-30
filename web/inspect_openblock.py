from pathlib import Path
import json, tarfile
print('cwd', Path.cwd())
# inspect tarball
with tarfile.open('openblock-gui.tgz', 'r:gz') as tar:
    names = tar.getnames()
    print('contains', len(names), 'entries')
    for name in names:
        if name.startswith('package/package.json') or 'openblock-gui.js' in name or 'package/dist/openblock-gui.js' in name:
            print('entry:', name)
    if 'package/package.json' in names:
        package = json.load(tar.extractfile('package/package.json'))
        print('package.main=', package.get('main'))
        print('package.browser=', package.get('browser'))
        print('package.exports=', package.get('exports'))

# inspect module header
text = Path('openblock-gui.js').read_text(errors='ignore')
for pat in ['root["GUI"]', 'root.GUI', 'window["GUI"]', 'window.GUI', 'module.exports', 'exports["default"]', 'exports.default', 'require("react")', 'require("react-dom")', 'createEditor', 'loadProject', 'saveProject', 'loadExtensions', 'loadToolbox', 'exportArduino', 'ScratchGui']:
    print(pat, text.find(pat))
print('---header---')
print(text[:500])
