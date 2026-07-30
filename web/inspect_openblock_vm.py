from pathlib import Path
import vm

code = Path('openblock-gui.js').read_text(encoding='utf-16', errors='ignore')
context = {
    'window': {},
    'root': {},
    'console': __import__('sys').modules['builtins'].__dict__['print'],
    'setTimeout': lambda *args, **kwargs: None,
    'setInterval': lambda *args, **kwargs: None,
    'clearTimeout': lambda *args, **kwargs: None,
    'clearInterval': lambda *args, **kwargs: None,
    'react': {'createElement': lambda *args, **kwargs: {'type': args[0], 'props': args[1] if len(args) > 1 else None, 'children': args[2:]}, 'Component': type('Component', (), {})},
    'react-dom': {'render': lambda *args, **kwargs: None, 'createPortal': lambda *args, **kwargs: None},
}
context['root'] = context['window']
vm.create_context(context)
vm.run(code, context)
GUI = context['window'].get('GUI') or context['root'].get('GUI')
print('GUI type', type(GUI))
if GUI is not None:
    print('GUI keys', list(GUI.keys())[:50])
    # maybe inspect nested keys
    if hasattr(GUI, '__dict__'):
        print('GUI __dict__ keys', list(GUI.__dict__.keys())[:50])
print('done')
