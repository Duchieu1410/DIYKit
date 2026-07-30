// NOTE: This script-injection loader is superseded by the iframe embed approach.
// Kept for reference; the type import below was removed as the file no longer exists.

const OPENBLOCK_GLOBAL = 'GUI';
const OPENBLOCK_SCRIPT_ID = 'openblock-runtime-script';
const OPENBLOCK_CHUNKS_BASE = '/openblock-runtime/chunks/';

export async function ensureOpenBlockRuntime(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('OpenBlock runtime can only be loaded in the browser.');
  }

  const globalAny = window as any;
  if (globalAny[OPENBLOCK_GLOBAL]) {
    return;
  }

  const existing = document.getElementById(OPENBLOCK_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    await waitForGlobal();
    return;
  }

  const script = document.createElement('script');
  script.id = OPENBLOCK_SCRIPT_ID;
  script.type = 'text/javascript';
  script.src = '/openblock-runtime/openblock-gui.js';
  script.async = true;
  script.onerror = () => {
    script.dataset.error = 'load-failed';
  };
  document.head.appendChild(script);

  await waitForGlobal();
}

function waitForGlobal(): Promise<void> {
  return new Promise((resolve, reject) => {
    const globalAny = window as any;
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('OpenBlock runtime failed to load within 10 seconds.'));
    }, 10000);

    function cleanup() {
      window.clearTimeout(timeout);
      window.removeEventListener('openblock-runtime-ready', onReady);
    }

    function onReady() {
      cleanup();
      resolve();
    }

    window.addEventListener('openblock-runtime-ready', onReady);

    if (globalAny[OPENBLOCK_GLOBAL]) {
      cleanup();
      resolve();
    }
  });
}

export function getOpenBlockGlobal(): unknown {
  if (typeof window === 'undefined') {
    throw new Error('OpenBlock runtime can only be used in the browser.');
  }
  const globalAny = window as any;
  if (!globalAny[OPENBLOCK_GLOBAL]) {
    throw new Error('OpenBlock runtime is not loaded. Ensure /openblock-runtime/openblock-gui.js is available and loaded before calling the editor wrapper.');
  }
  return globalAny[OPENBLOCK_GLOBAL];
}
