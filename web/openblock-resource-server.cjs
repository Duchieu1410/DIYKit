'use strict';

/**
 * OpenBlock Resource Server — port 20112
 *
 * Mimics the OpenBlock Link local-server API so that openblock-gui can discover
 * external devices (ThingBot, CoBotC3, ViaBanhMi) and their extensions.
 *
 * IMPORTANT: icon URLs must be returned as RELATIVE paths (e.g. "devices/thingBotC3/assets/thingbot.png").
 * The GUI prepends `localResourcesServerUrl` itself — if we return full URLs they get double-prefixed.
 *
 * IMPORTANT: Devices must be sorted so that the base device (e.g. thingBot_esp32C3) comes BEFORE
 * its framework variants (thingBot_arduinoEsp32C3). The GUI's filter is an ordered state machine
 * that tracks `currentBases` — it breaks if base + variants are not adjacent.
 *
 * API surface:
 *   GET /devices/{locale}.json          → device list
 *   GET /devices/{dir}/...              → static device asset files
 *   GET /extensions/{locale}.json       → extension list
 *   GET /extensions/{dir}/...           → static extension asset files
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 20112;
const HOST = '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;
const RESOURCES_DIR = path.resolve(
  __dirname,
  'src/lib/editor/vendor/thingblock-external-resources'
);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Minimal formatMessage used by device/extension index.js files */
function formatMessage(msg) {
  if (typeof msg === 'string') return msg;
  return msg.default || msg.id || '';
}
formatMessage.setup = () => ({ locale: 'en' });

/**
 * Convert an asset URL to a relative path suitable for the OpenBlock GUI.
 * The GUI prepends localResourcesServerUrl to whatever we return, so we must
 * return relative paths like "devices/thingBotC3/assets/thingbot.png".
 */
function toRelativeAssetUrl(kind, dir, assetUrl) {
  if (!assetUrl) return assetUrl;
  // Already a data URI or external URL — leave as-is
  if (/^(https?:|data:)/.test(assetUrl)) return assetUrl;
  // Remove any leading slash from the asset path
  const clean = assetUrl.replace(/^\/+/, '');
  return `${kind}/${dir}/${clean}`;
}

const MIME = {
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.css':  'text/css',
  '.cur':  'image/vnd.microsoft.icon',
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ---------------------------------------------------------------------------
// device loader
// ---------------------------------------------------------------------------
// Each directory in devices/ can export one or more device objects.
// We preserve directory order so base + variant stay adjacent (required by GUI filter).
const DEVICE_DIRS = ['thingBotC3', 'coBotC3', 'viaBanhMi'];

function mapDeviceIdForGui(deviceId) {
  if (!deviceId) return deviceId;
  // OpenBlock GUI built-in deviceData recognizes 'arduinoEsp32', but not 'arduinoEsp32C3'
  return deviceId
    .replace(/arduinoEsp32C3$/, 'arduinoEsp32')
    .replace(/_esp32C3$/, '_esp32');
}

function loadDevicesFromDir(dir) {
  const indexFile = path.join(RESOURCES_DIR, 'devices', dir, 'index.js');
  if (!fs.existsSync(indexFile)) {
    console.warn(`  [resources] device not found: ${dir}`);
    return [];
  }
  try {
    delete require.cache[require.resolve(indexFile)];
    const factory = require(indexFile);
    const result = factory(formatMessage);
    const list = Array.isArray(result) ? result : [result];
    return list
      .filter(Boolean)
      .map(dev => ({
        ...dev,
        deviceId: mapDeviceIdForGui(dev.deviceId),
        // Return relative asset URLs — GUI prepends its base URL
        iconURL:               toRelativeAssetUrl('devices', dir, dev.iconURL),
        connectionIconURL:     toRelativeAssetUrl('devices', dir, dev.connectionIconURL),
        connectionSmallIconURL: toRelativeAssetUrl('devices', dir, dev.connectionSmallIconURL),
      }));
  } catch (err) {
    console.error(`  [resources] failed to load device ${dir}: ${err.message}`);
    return [];
  }
}

function loadAllDevices() {
  // Keep directories in order: base device must come before its framework variants
  // so the GUI filter state machine works correctly.
  return DEVICE_DIRS.flatMap(dir => loadDevicesFromDir(dir));
}

// ---------------------------------------------------------------------------
// extension loader
// ---------------------------------------------------------------------------
function loadAllExtensions() {
  const extDir = path.join(RESOURCES_DIR, 'extensions');
  if (!fs.existsSync(extDir)) return [];

  return fs.readdirSync(extDir)
    .filter(d => fs.statSync(path.join(extDir, d)).isDirectory())
    .flatMap(dir => {
      const indexFile = path.join(extDir, dir, 'index.js');
      if (!fs.existsSync(indexFile)) return [];
      try {
        delete require.cache[require.resolve(indexFile)];
        const factory = require(indexFile);
        const result = typeof factory === 'function' ? factory(formatMessage) : factory;
        const list = Array.isArray(result) ? result : [result];
        return list.filter(Boolean).map(ext => ({
          ...ext,
          ...(ext.iconURL && !/^(https?:|data:)/.test(ext.iconURL)
            ? { iconURL: toRelativeAssetUrl('extensions', dir, ext.iconURL) }
            : {}),
        }));
      } catch (_) {
        return []; // extension may not follow the same contract
      }
    });
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  const reqPath = (req.url || '/').split('?')[0];
  console.log(`  [resources] ${req.method} ${reqPath}`);

  // GET /devices/{locale}.json
  if (/^\/devices\/[\w-]+\.json$/.test(reqPath)) {
    const devices = loadAllDevices();
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(devices, null, 2));
    return;
  }

  // GET /extensions/{locale}.json
  if (/^\/extensions\/[\w-]+\.json$/.test(reqPath)) {
    const exts = loadAllExtensions();
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(exts, null, 2));
    return;
  }

  // GET /devices/{dir}/... or /extensions/{dir}/...
  const fileMatch = reqPath.match(/^\/(devices|extensions)\/([^/]+)\/(.+)$/);
  if (fileMatch) {
    const [, kind, dir, relPath] = fileMatch;
    const filePath = path.join(RESOURCES_DIR, kind, dir, relPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { ...CORS, 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.writeHead(404, { ...CORS, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', path: reqPath }));
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.log(`  [resources] port ${PORT} already in use — using existing instance`);
  } else {
    console.error('  [resources] server error:', err);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  [OpenBlock Resource Server] ${BASE_URL}`);
  console.log(`  Devices: ${DEVICE_DIRS.join(', ')}`);
  console.log(`  Resources dir: ${RESOURCES_DIR}\n`);
});
