/**
 * Shared application stores placeholder.
 *
 * Feature-specific state and cross-app stores will be added later.
 */

import { writable } from 'svelte/store';

export const appReady = writable(false);
