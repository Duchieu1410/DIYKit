# OpenBlock Vendor Runtime

This folder contains third-party OpenBlock integration assets for the editor wrapper.

## What is included

- `openblockRuntime.ts` is the adapter layer used by `src/lib/editor/openblockWrapper.ts`.
- `thingblock-external-resources` is a clone of the external resources repository.

## Important

The cloned `thingblock-external-resources` repository contains resource definitions and extension metadata, not the main OpenBlock browser editor runtime.

To complete the integration:

1. Add or build the actual OpenBlock browser runtime.
2. Expose it via `window.OpenBlock`.
3. Ensure the runtime implements:
   - `createEditor(container: HTMLElement)`
   - `loadProject(payload)`
   - `saveProject()`
   - `loadExtensions(extensions)`
   - `loadToolbox(toolbox)`
   - `exportArduino()`

## Local development flow

- Keep the app using `OpenBlockEditor` from `src/lib/editor/openblockWrapper.ts`.
- Keep runtime-specific changes inside `src/lib/editor/vendor/openblockRuntime.ts`.
- Use `OpenBlockEditorHost.svelte` to mount the editor in UI pages.
