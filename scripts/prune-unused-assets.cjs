/**
 * Elimina de `dist/_astro` los archivos que no referencia nada del sitio.
 *
 * Astro emite el original de cada imagen importada por las colecciones de
 * contenido aunque en las páginas solo se usen las variantes optimizadas.
 * Con un archivo de más de doscientas fotografías eso duplica el peso del
 * sitio sin que ningún navegador llegue a pedir esos archivos.
 *
 * La poda es conservadora: solo borra un archivo si su nombre no aparece en
 * ningún HTML, CSS, JS, JSON, XML ni mapa del sitio generado.
 *
 * Uso:  node scripts/prune-unused-assets.cjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ASSETS = path.join(DIST, '_astro');

if (!fs.existsSync(ASSETS)) {
  console.log('No hay dist/_astro: nada que podar.');
  process.exit(0);
}

const SCANNED_EXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// Texto de todo lo que puede citar un asset.
const haystack = walk(DIST)
  .filter((f) => SCANNED_EXT.has(path.extname(f).toLowerCase()))
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n');

const assets = fs.readdirSync(ASSETS);
let removed = 0;
let freed = 0;

for (const name of assets) {
  // Los propios ficheros escaneados se citan entre sí: no se tocan.
  if (SCANNED_EXT.has(path.extname(name).toLowerCase())) continue;
  if (haystack.includes(name)) continue;

  const full = path.join(ASSETS, name);
  freed += fs.statSync(full).size;
  fs.unlinkSync(full);
  removed++;
}

console.log(
  `Assets sin usar eliminados: ${removed} (${(freed / 1e6).toFixed(1)} MB liberados)`,
);
