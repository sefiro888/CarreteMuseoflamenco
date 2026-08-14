/**
 * Ingesta del archivo original de la familia Losada.
 *
 * Lee la carpeta de material bruto (fotos, prensa en PDF, vídeo, audio),
 * normaliza las imágenes a un tamaño razonable para web y las deja en
 * `src/assets/archivo/`, donde Astro genera después las variantes
 * responsive en AVIF/WebP.
 *
 * No modifica ni borra nada de la carpeta de origen: solo lee.
 *
 * Uso:  node scripts/ingest-archive.cjs "<ruta de la carpeta original>"
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) {
  console.error('Falta la ruta de la carpeta original, o no existe.');
  console.error('Uso: node scripts/ingest-archive.cjs "<ruta>"');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const IMG_OUT = path.join(ROOT, 'src', 'assets', 'archivo');
const DOC_OUT = path.join(ROOT, 'public', 'hemeroteca');

fs.mkdirSync(IMG_OUT, { recursive: true });
fs.mkdirSync(DOC_OUT, { recursive: true });

// Ancho máximo para la web. El original se conserva en la carpeta de
// procedencia de la familia; aquí solo entra una copia apta para publicar.
const MAX_EDGE = 2000;
const QUALITY = 80;

const IMG_EXT = /\.(jpe?g|png|webp|tif|tiff)$/i;
const DOC_EXT = /\.pdf$/i;

function hashFile(p) {
  return crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
}

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

(async () => {
  const files = fs.readdirSync(SRC);
  const seen = new Map(); // hash -> slug ya procesado
  const manifest = [];
  let skippedDupes = 0;

  for (const file of files) {
    const full = path.join(SRC, file);
    if (!fs.statSync(full).isFile()) continue;

    const isImg = IMG_EXT.test(file);
    const isDoc = DOC_EXT.test(file);
    if (!isImg && !isDoc) continue;

    const hash = hashFile(full);
    if (seen.has(hash)) {
      skippedDupes++;
      manifest.push({ file, duplicateOf: seen.get(hash) });
      continue;
    }

    const base = path.basename(file, path.extname(file));
    const slug = slugify(base);
    seen.set(hash, slug);

    if (isImg) {
      const dest = path.join(IMG_OUT, `${slug}.jpg`);
      try {
        const img = sharp(full, { limitInputPixels: false }).rotate();
        const meta = await img.metadata();
        await img
          .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: QUALITY, mozjpeg: true })
          .toFile(dest);
        const outMeta = await sharp(dest).metadata();
        manifest.push({
          file,
          slug,
          kind: 'image',
          asset: `${slug}.jpg`,
          sourceWidth: meta.width,
          sourceHeight: meta.height,
          width: outMeta.width,
          height: outMeta.height,
        });
      } catch (e) {
        console.error('  ! error con', file, '-', e.message.slice(0, 60));
      }
    } else {
      const dest = path.join(DOC_OUT, `${slug}.pdf`);
      fs.copyFileSync(full, dest);
      manifest.push({
        file,
        slug,
        kind: 'document',
        asset: `${slug}.pdf`,
        bytes: fs.statSync(full).size,
      });
    }
  }

  fs.writeFileSync(
    path.join(ROOT, 'scripts', 'archive-manifest.json'),
    JSON.stringify(manifest, null, 1),
  );

  const imgs = manifest.filter((m) => m.kind === 'image').length;
  const docs = manifest.filter((m) => m.kind === 'document').length;
  console.log(`Imágenes procesadas: ${imgs}`);
  console.log(`Documentos copiados: ${docs}`);
  console.log(`Duplicados exactos omitidos: ${skippedDupes}`);
})();
