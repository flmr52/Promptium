/**
 * ============================================================
 * SCRIPT DE BUILD : Génération du fichier HTML unique
 * ============================================================
 * Ce script produit un fichier dist/index.html 100% autonome :
 * - Bundle et minifie tout le JavaScript (via esbuild)
 * - Concatène tous les fichiers CSS
 * - Inline le tout dans le HTML (balises <style> et <script>)
 * - Supprime les références aux ressources externes (Google Fonts)
 *
 * Le résultat fonctionne en file:// (envoyé par mail) et sur
 * n'importe quel hébergeur statique (GitHub Pages, Netlify, etc.)
 *
 * Usage : node scripts/build.js
 * ============================================================
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Résolution des chemins à partir de ce fichier
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src');
const DIST = resolve(ROOT, 'dist');

async function bundle() {
  // Créer le dossier dist/ s'il n'existe pas
  mkdirSync(DIST, { recursive: true });

  // ---- Étape 1 : Bundler le JavaScript avec esbuild ----
  // Transforme les modules ES6 en un seul fichier IIFE minifié
  const result = await build({
    entryPoints: [resolve(SRC, 'js/main.js')],
    bundle: true,       // Résoudre tous les imports
    format: 'iife',     // Format auto-exécutable (pas besoin de type="module")
    minify: true,       // Réduire la taille
    write: false,       // Ne pas écrire sur disque, récupérer le contenu en mémoire
    loader: { '.json': 'json' }  // Permettre l'import de fichiers JSON
  });

  const js = result.outputFiles[0].text;

  // ---- Étape 2 : Concaténer tous les fichiers CSS ----
  // L'ordre est important : variables d'abord, responsive en dernier
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

  // ---- Étape 3 : Lire le HTML source et injecter CSS + JS ----
  let html = readFileSync(resolve(SRC, 'index.html'), 'utf-8');

  // Supprimer les liens vers les CSS externes (remplacés par inline)
  html = html.replace(/<link rel="stylesheet" href="css\/[^"]+"\s*\/?>\s*/g, '');

  // Injecter le CSS en inline avant </head>
  html = html.replace(
    '</head>',
    `  <style>\n${css}\n  </style>\n</head>`
  );

  // Remplacer le <script type="module"> par le bundle inline
  html = html.replace(
    /<script type="module" src="js\/main\.js"><\/script>/,
    `<script>\n${js}\n</script>`
  );

  // Supprimer les liens Google Fonts (le fichier doit être autonome)
  html = html.replace(
    /<link rel="preconnect"[^>]*>\s*/g, ''
  );
  html = html.replace(
    /<link[^>]*fonts\.googleapis\.com[^>]*>\s*/g, ''
  );

  // ---- Étape 4 : Écrire le fichier final ----
  writeFileSync(resolve(DIST, 'index.html'), html, 'utf-8');
  console.log(`Build complete: dist/index.html (${Math.round(html.length / 1024)} KB)`);
}

// Lancer le build et afficher les erreurs éventuelles
bundle().catch(err => {
  console.error(err);
  process.exit(1);
});
