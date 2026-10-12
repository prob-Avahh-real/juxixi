import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const www = path.join(root, 'www');

fs.mkdirSync(path.join(www, 'js'), { recursive: true });

esbuild.buildSync({
  entryPoints: [path.join(root, 'src', 'app.js')],
  bundle: true,
  format: 'iife',
  outfile: path.join(www, 'js', 'app.js'),
  sourcemap: true,
  target: ['es2020'],
});

fs.copyFileSync(path.join(root, 'index.html'), path.join(www, 'index.html'));
fs.copyFileSync(path.join(root, 'src', 'wearable-input.js'), path.join(www, 'js', 'wearable-input.js'));

// PWA 静态资源：manifest + service worker + icon 同步进 www/
for (const f of ['manifest.webmanifest', 'sw.js', 'icon.svg']) {
  fs.copyFileSync(path.join(root, 'public', f), path.join(www, f));
}
console.log('Built juxixi → www/');
