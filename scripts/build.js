import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src');
const DIST = resolve(ROOT, 'dist');

async function bundle() {
  mkdirSync(DIST, { recursive: true });

  const result = await build({
    entryPoints: [resolve(SRC, 'js/main.js')],
    bundle: true,
    format: 'iife',
    minify: true,
    write: false
  });

  const js = result.outputFiles[0].text;

  const cssFiles = [
    'css/variables.css',
    'css/base.css',
    'css/builder.css',
    'css/library.css',
    'css/components.css',
    'css/responsive.css'
  ];

  const css = cssFiles
    .map(f => readFileSync(resolve(SRC, f), 'utf-8'))
    .join('\n');

  let html = readFileSync(resolve(SRC, 'index.html'), 'utf-8');

  html = html.replace(/<link rel="stylesheet" href="css\/[^"]+"\s*\/?>\s*/g, '');
  html = html.replace(
    '</head>',
    `  <style>\n${css}\n  </style>\n</head>`
  );

  html = html.replace(
    /<script type="module" src="js\/main\.js"><\/script>/,
    `<script>\n${js}\n</script>`
  );

  html = html.replace(
    /<link rel="preconnect"[^>]*>\s*/g, ''
  );
  html = html.replace(
    /<link[^>]*fonts\.googleapis\.com[^>]*>\s*/g, ''
  );

  writeFileSync(resolve(DIST, 'index.html'), html, 'utf-8');
  console.log(`Build complete: dist/index.html (${Math.round(html.length / 1024)} KB)`);
}

bundle().catch(err => {
  console.error(err);
  process.exit(1);
});
