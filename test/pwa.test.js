import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

describe('PWA offline (milestone G)', () => {
  it('manifest.webmanifest is valid and complete', () => {
    const m = JSON.parse(read('public/manifest.webmanifest'));
    assert.equal(m.name.includes('剧西西'), true);
    assert.ok(m.short_name);
    assert.equal(m.display, 'standalone');
    assert.ok(m.start_url);
    assert.ok(m.theme_color);
    assert.ok(m.background_color);
    assert.ok(Array.isArray(m.icons) && m.icons.length > 0);
  });

  it('sw.js caches core assets and handles fetch', () => {
    const sw = read('public/sw.js');
    assert.ok(sw.includes('caches.open'));
    assert.ok(sw.includes('addEventListener(\'fetch\''));
    assert.ok(sw.includes('addEventListener(\'install\''));
    assert.ok(sw.includes('addEventListener(\'activate\''));
    assert.ok(sw.includes('index.html'));
    assert.ok(sw.includes('js/app.js'));
  });

  it('icon.svg exists', () => {
    assert.ok(fs.existsSync(path.join(root, 'public', 'icon.svg')));
  });

  it('index.html links the manifest and registers the service worker', () => {
    const html = read('index.html');
    assert.ok(html.includes('rel="manifest" href="manifest.webmanifest"'));
    assert.ok(html.includes('serviceWorker.register(\'sw.js\')'));
  });

  it('build-web.js ships PWA assets into www/', () => {
    const script = read('scripts/build-web.js');
    assert.ok(script.includes('manifest.webmanifest'));
    assert.ok(script.includes('sw.js'));
    assert.ok(script.includes('icon.svg'));
  });
});
