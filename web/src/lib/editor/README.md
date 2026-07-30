# OpenBlock Editor Wrapper

This directory contains the application-facing OpenBlock integration boundary.

## Purpose

- Treat OpenBlock as a reusable module.
- Avoid modifying OpenBlock source directly.
- Encapsulate all OpenBlock-specific adaptation inside `src/lib/editor/`.
- Expose a stable interface for the rest of the app.

## Public API

The wrapper exposes the following methods through `OpenBlockEditor`.

- `loadProject(payload)`
- `saveProject()`
- `loadExtensions(extensions)`
- `loadToolbox(toolbox)`
- `exportArduino()`

The application should only interact with this wrapper.

## Integration strategy

1. Add OpenBlock runtime assets under `src/lib/editor/vendor/`.
2. Implement runtime-specific methods in `vendor/openblockRuntime.ts`.
3. Keep all OpenBlock API translation inside `src/lib/editor/openblockWrapper.ts`.

## OpenBlock runtime requirement

The local folder `src/lib/editor/vendor/thingblock-external-resources` contains OpenBlock external resources, not the browser runtime/editor application itself.

To make the editor functional you must:

- supply a browser-ready OpenBlock runtime bundle
- expose it as `window.OpenBlock`
- ensure the runtime exports `createEditor(container)` plus project/toolbox/extension/export methods

This wrapper is already implemented to call that runtime once it is available.

## Updating OpenBlock

When updating OpenBlock in the future:

1. Replace or update the source assets under `src/lib/editor/vendor/`.
2. Reconcile the runtime API with the wrapper methods.
3. Only change `openblockWrapper.ts` and `vendor/openblockRuntime.ts` if the upstream API changed.
4. Preserve the rest of the application by keeping the public interface stable.

## Minimal-conflict update process

- Do not touch application code that calls `OpenBlockEditor`.
- Do not modify upstream OpenBlock source files directly.
- Keep a small adapter layer in `openblockWrapper.ts`.
- Add regression tests around wrapper method signatures if needed.
