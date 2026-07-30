import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'node:path';
import fs, { type Stats } from 'node:fs';
import { spawn, type ChildProcess } from 'node:child_process';
import type { IncomingMessage, ServerResponse } from 'node:http';

// ---------------------------------------------------------------------------
// OpenBlock Resource Server — port 20112
//
// The openblock-gui.js bundle has `localResourcesServerUrl = 'http://127.0.0.1:20112/'`
// hard-coded. This plugin spawns openblock-resource-server.cjs on that port
// automatically when `vite dev` starts so that the GUI can discover the
// ThingBot / CoBotC3 / ViaBanhMi devices from thingblock-external-resources.
// ---------------------------------------------------------------------------
let resourceServer: ChildProcess | null = null;

function spawnResourceServer() {
	if (resourceServer && !resourceServer.killed) return;

	const script = path.resolve('./openblock-resource-server.cjs');
	if (!fs.existsSync(script)) {
		console.warn('[thingblock] openblock-resource-server.cjs not found — devices will not load');
		return;
	}

	resourceServer = spawn('node', [script], {
		stdio: 'inherit',
		shell: false,
	});

	resourceServer.on('error', (err) => {
		console.error('[thingblock] resource server spawn error:', err.message);
	});

	resourceServer.on('exit', (code) => {
		if (code !== null && code !== 0) {
			console.warn(`[thingblock] resource server exited with code ${code}`);
		}
		resourceServer = null;
	});
}

// ---------------------------------------------------------------------------
// Tiny Vite plugin: serve thingblock-external-resources at /openblock-resources/
// (fallback path, in case something wants to reach resources via the Vite server)
// ---------------------------------------------------------------------------
function thingblockResourcesPlugin() {
	const resourcesRoot = path.resolve(
		'./src/lib/editor/vendor/thingblock-external-resources'
	);

	return {
		name: 'thingblock-resources',
		// Dev: spawn the OpenBlock resource server and set up a Vite middleware
		configureServer(server: {
			middlewares: { use: (path: string, fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void };
			httpServer: { on: (event: string, listener: (...args: unknown[]) => void) => void } | null;
		}) {
			// Start the local resource server on port 20112
			spawnResourceServer();

			// Cleanup when the Vite dev server closes
			server.httpServer?.on('close', () => {
				if (resourceServer && !resourceServer.killed) {
					resourceServer.kill();
					resourceServer = null;
				}
			});

			// Rewrite /openblock/static/* → /static/* for iframe-relative asset requests
			// (some <img> src values inside the GUI iframe resolve relative to /openblock/)
			server.middlewares.use(
				'/openblock/static',
				(req: IncomingMessage, res: ServerResponse, next: () => void) => {
					const rel = decodeURIComponent(req.url ?? '/');
					const filePath = path.join(path.resolve('./static/static'), rel);
					fs.stat(filePath, (err: NodeJS.ErrnoException | null, stat: Stats) => {
						if (err || !stat.isFile()) return next();
						const ext = path.extname(filePath).toLowerCase();
						const mime: Record<string, string> = {
							'.svg': 'image/svg+xml', '.png': 'image/png',
							'.gif': 'image/gif', '.cur': 'image/vnd.microsoft.icon',
							'.js': 'application/javascript', '.json': 'application/json',
						};
						res.setHeader('Content-Type', mime[ext] ?? 'application/octet-stream');
						res.setHeader('Access-Control-Allow-Origin', '*');
						fs.createReadStream(filePath).pipe(res);
					});
				}
			);
			server.middlewares.use(
				'/openblock-resources',
				(req: IncomingMessage, res: ServerResponse, next: () => void) => {
					const rel = decodeURIComponent(req.url ?? '/').replace(/^\//, '');
					const filePath = path.join(resourcesRoot, rel);
					fs.stat(filePath, (err: NodeJS.ErrnoException | null, stat: Stats) => {
						if (err || !stat.isFile()) {
							return next();
						}
						const ext = path.extname(filePath).toLowerCase();
						const mime: Record<string, string> = {
							'.json': 'application/json',
							'.js': 'application/javascript',
							'.png': 'image/png',
							'.jpg': 'image/jpeg',
							'.jpeg': 'image/jpeg',
							'.svg': 'image/svg+xml',
							'.md': 'text/markdown',
						};
						res.setHeader('Content-Type', mime[ext] ?? 'application/octet-stream');
						res.setHeader('Access-Control-Allow-Origin', '*');
						fs.createReadStream(filePath).pipe(res);
					});
				}
			);
		},
	};
}

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter()
		}),
		thingblockResourcesPlugin(),
	]
});
