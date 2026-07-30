from pathlib import Path
path = Path('openblock-gui.js')
raw = path.read_bytes()
for enc in ['utf-16', 'utf-16-le', 'utf-16-be', 'utf-8', 'latin-1']:
    try:
        text = raw.decode(enc)
        if 'webpackUniversalModuleDefinition' in text[:2000]:
            print('DECODING', enc)
            patterns = ['root["GUI"]', 'root.GUI', 'window["GUI"]', 'window.GUI', 'module.exports', 'exports["default"]', 'exports.default', 'require("react")', 'require("react-dom")', 'createEditor', 'loadProject', 'saveProject', 'loadExtensions', 'loadToolbox', 'exportArduino', 'ScratchGui', 'OpenBlock']
            for p in patterns:
                print(p, text.find(p))
            print('---HEAD---')
            print(text[:800])
            break
    except Exception as e:
        print('failed', enc, e)
