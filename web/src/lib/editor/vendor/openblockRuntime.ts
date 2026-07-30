import type { OpenBlockProjectPayload, OpenBlockToolboxConfig } from '../types.js';

const getOpenBlockGlobal = (): any => {
  if (typeof window === 'undefined') {
    throw new Error('OpenBlock runtime can only be used in the browser.');
  }

  const globalAny = window as any;
  if (!globalAny.OpenBlock) {
    throw new Error(
      'OpenBlock runtime is not loaded. Place the OpenBlock editor source under src/lib/editor/vendor or expose it on window.OpenBlock.'
    );
  }

  return globalAny.OpenBlock;
};

export async function createEditor(container: HTMLElement): Promise<any> {
  const OpenBlock = getOpenBlockGlobal();

  if (typeof OpenBlock.createEditor !== 'function') {
    throw new Error('OpenBlock runtime does not expose createEditor(container).');
  }

  return OpenBlock.createEditor(container);
}

export async function loadProject(editorInstance: any, payload: OpenBlockProjectPayload): Promise<void> {
  if (editorInstance && typeof editorInstance.loadProject === 'function') {
    return editorInstance.loadProject(payload);
  }

  const OpenBlock = getOpenBlockGlobal();
  if (typeof OpenBlock.loadProject === 'function') {
    return OpenBlock.loadProject(payload);
  }

  throw new Error('OpenBlock runtime does not support loadProject.');
}

export async function saveProject(editorInstance: any): Promise<OpenBlockProjectPayload> {
  if (editorInstance && typeof editorInstance.saveProject === 'function') {
    return editorInstance.saveProject();
  }

  const OpenBlock = getOpenBlockGlobal();
  if (typeof OpenBlock.saveProject === 'function') {
    return OpenBlock.saveProject();
  }

  throw new Error('OpenBlock runtime does not support saveProject.');
}

export async function loadExtensions(editorInstance: any, extensions: string[]): Promise<void> {
  if (editorInstance && typeof editorInstance.loadExtensions === 'function') {
    return editorInstance.loadExtensions(extensions);
  }

  const OpenBlock = getOpenBlockGlobal();
  if (typeof OpenBlock.loadExtensions === 'function') {
    return OpenBlock.loadExtensions(extensions);
  }

  throw new Error('OpenBlock runtime does not support loadExtensions.');
}

export async function loadToolbox(editorInstance: any, toolbox: OpenBlockToolboxConfig): Promise<void> {
  if (editorInstance && typeof editorInstance.loadToolbox === 'function') {
    return editorInstance.loadToolbox(toolbox);
  }

  const OpenBlock = getOpenBlockGlobal();
  if (typeof OpenBlock.loadToolbox === 'function') {
    return OpenBlock.loadToolbox(toolbox);
  }

  throw new Error('OpenBlock runtime does not support loadToolbox.');
}

export async function exportArduino(editorInstance: any): Promise<string> {
  if (editorInstance && typeof editorInstance.exportArduino === 'function') {
    return editorInstance.exportArduino();
  }

  const OpenBlock = getOpenBlockGlobal();
  if (typeof OpenBlock.exportArduino === 'function') {
    return OpenBlock.exportArduino();
  }

  throw new Error('OpenBlock runtime does not support exportArduino.');
}
