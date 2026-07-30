import type { OpenBlockEditorApi, OpenBlockProjectPayload, OpenBlockToolboxConfig } from './types.js';
import * as runtime from './vendor/openblockRuntime.js';

/**
 * OpenBlock editor wrapper.
 *
 * The application should interact only with this wrapper.
 * All OpenBlock runtime integration belongs inside vendor/openblockRuntime.ts.
 */

class OpenBlockWrapper implements OpenBlockEditorApi {
  private editorInstance: any;
  private mountContainer: HTMLElement | null = null;

  constructor(editorInstance?: any) {
    this.editorInstance = editorInstance;
  }

  attach(editorInstance: any) {
    if (editorInstance instanceof HTMLElement) {
      this.mountContainer = editorInstance;
      return;
    }

    this.editorInstance = editorInstance;
  }

  private async ensureEditorInstance(): Promise<any> {
    if (this.editorInstance) {
      return this.editorInstance;
    }

    if (!this.mountContainer) {
      throw new Error('OpenBlock editor container has not been attached.');
    }

    if (typeof runtime.createEditor !== 'function') {
      throw new Error('OpenBlock runtime adapter does not expose createEditor.');
    }

    this.editorInstance = await runtime.createEditor(this.mountContainer);
    return this.editorInstance;
  }

  async loadProject(payload: OpenBlockProjectPayload): Promise<void> {
    const editor = await this.ensureEditorInstance();
    return runtime.loadProject(editor, payload);
  }

  async saveProject(): Promise<OpenBlockProjectPayload> {
    const editor = await this.ensureEditorInstance();
    return runtime.saveProject(editor);
  }

  async loadExtensions(extensions: string[]): Promise<void> {
    const editor = await this.ensureEditorInstance();
    return runtime.loadExtensions(editor, extensions);
  }

  async loadToolbox(toolbox: OpenBlockToolboxConfig): Promise<void> {
    const editor = await this.ensureEditorInstance();
    return runtime.loadToolbox(editor, toolbox);
  }

  async exportArduino(): Promise<string> {
    const editor = await this.ensureEditorInstance();
    return runtime.exportArduino(editor);
  }
}

export const OpenBlockEditor = new OpenBlockWrapper();
