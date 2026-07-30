export type OpenBlockProjectPayload = {
  xml?: string;
  json?: unknown;
};

export type OpenBlockToolboxConfig = {
  categories?: string[];
  blocks?: string[];
};

export type OpenBlockEditorApi = {
  loadProject: (payload: OpenBlockProjectPayload) => Promise<void>;
  saveProject: () => Promise<OpenBlockProjectPayload>;
  loadExtensions: (extensions: string[]) => Promise<void>;
  loadToolbox: (toolbox: OpenBlockToolboxConfig) => Promise<void>;
  exportArduino: () => Promise<string>;
};
