const fs = require('fs');
const vm = require('vm');
const path = require('path');
const raw = fs.readFileSync(path.resolve('openblock-gui.js'));
const code = raw.toString('utf16le');
const context = {
  window: {},
  root: {},
  console,
  setTimeout: () => {},
  setInterval: () => {},
  clearTimeout: () => {},
  clearInterval: () => {},
  require: (name) => {
    if (name === 'react') {
      return {
        createElement: (...args) => ({ type: args[0], props: args[1] || {}, children: args.slice(2) }),
        Component: class {},
        PureComponent: class {},
        createRef: () => ({ current: null }),
      };
    }
    if (name === 'react-dom') {
      return { render: () => {}, createPortal: () => {}, hydrate: () => {} };
    }
    throw new Error('Unexpected require: ' + name);
  },
};
context.root = context.window;
vm.createContext(context);
try {
  vm.runInContext(code, context);
} catch (e) {
  console.error('bundle evaluation error', e);
}
const GUI = context.window.GUI || context.root.GUI;
console.log('GUI type:', typeof GUI);
if (GUI) {
  console.log('GUI has default property?', Object.prototype.hasOwnProperty.call(GUI, 'default'));
  console.log('GUI keys:', Object.keys(GUI).slice(0, 200));
  if (GUI.default) {
    console.log('GUI.default type:', typeof GUI.default);
    console.log('GUI.default keys:', Object.keys(GUI.default).slice(0, 200));
  }
  console.log('GUI constructor name:', GUI.constructor && GUI.constructor.name);
}
