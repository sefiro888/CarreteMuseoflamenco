/**
 * Extrae la imagen escaneada que hay dentro de cada recorte de prensa en PDF
 * y genera una vista previa en JPEG para la hemeroteca.
 *
 * En lugar de rasterizar la página (que exige un canvas nativo y degrada el
 * escaneo), se extrae directamente el mapa de bits incrustado por el escáner,
 * que suele ser bilevel a alta resolución. El PDF original se conserva íntegro
 * en `public/hemeroteca/` para consulta y descarga.
 *
 * Uso:  node scripts/render-press.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(ROOT, 'public', 'hemeroteca');
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'hemeroteca');

fs.mkdirSync(OUT_DIR, { recursive: true });

const MAX_EDGE = 1800;

// pdfjs ImageKind
const GRAYSCALE_1BPP = 1;
const RGB_24BPP = 2;
const RGBA_32BPP = 3;

/** Desempaqueta un bitmap de 1 bit por píxel a 8 bits de gris. */
function unpack1bpp(data, width, height) {
  const stride = (width + 7) >> 3;
  const out = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    const outRow = y * width;
    for (let x = 0; x < width; x++) {
      const byte = data[rowStart + (x >> 3)];
      const bit = (byte >> (7 - (x & 7))) & 1;
      out[outRow + x] = bit ? 255 : 0;
    }
  }
  return out;
}

async function toSharp(obj) {
  const { width, height, kind, data } = obj;
  if (kind === GRAYSCALE_1BPP) {
    return sharp(unpack1bpp(data, width, height), {
      raw: { width, height, channels: 1 },
    });
  }
  if (kind === RGB_24BPP) {
    return sharp(Buffer.from(data.buffer || data), {
      raw: { width, height, channels: 3 },
    });
  }
  if (kind === RGBA_32BPP) {
    return sharp(Buffer.from(data.buffer || data), {
      raw: { width, height, channels: 4 },
    }).flatten({ background: '#ffffff' });
  }
  throw new Error('formato de imagen no contemplado: kind ' + kind);
}

(async () => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const files = fs.readdirSync(PDF_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'));
  const manifest = [];
  const failed = [];

  for (const file of files) {
    const slug = path.basename(file, '.pdf');
    const outPath = path.join(OUT_DIR, `${slug}.jpg`);
    try {
      const data = new Uint8Array(fs.readFileSync(path.join(PDF_DIR, file)));
      const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;
      const page = await doc.getPage(1);
      const ops = await page.getOperatorList();

      // Localizar el mayor XObject de imagen de la página: en un escaneo es
      // la propia página, y descarta logotipos o adornos sueltos.
      const names = [];
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjs.OPS.paintImageXObject) {
          names.push(ops.argsArray[i][0]);
        }
      }
      if (!names.length) throw new Error('la página no contiene imágenes');

      let best = null;
      for (const name of names) {
        const obj = await new Promise((res) => {
          try {
            page.objs.get(name, res);
          } catch {
            res(null);
          }
        });
        if (obj && obj.width && (!best || obj.width * obj.height > best.width * best.height)) {
          best = obj;
        }
      }
      if (!best) throw new Error('no se pudo leer el mapa de bits');

      const img = await toSharp(best);
      await img
        .resize(MAX_EDGE, MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 84, mozjpeg: true })
        .toFile(outPath);

      const meta = await sharp(outPath).metadata();
      manifest.push({
        slug,
        pdf: `/hemeroteca/${file}`,
        preview: `${slug}.jpg`,
        pages: doc.numPages,
        width: meta.width,
        height: meta.height,
        sourceWidth: best.width,
        sourceHeight: best.height,
      });
      await doc.destroy();
      process.stdout.write('.');
    } catch (e) {
      failed.push({ file, error: e.message.slice(0, 80) });
      process.stdout.write('x');
    }
  }

  fs.writeFileSync(
    path.join(ROOT, 'scripts', 'press-manifest.json'),
    JSON.stringify(manifest, null, 1),
  );
  console.log(`\nVistas previas generadas: ${manifest.length} de ${files.length}`);
  if (failed.length) {
    console.log('Sin vista previa:');
    failed.forEach((f) => console.log('  -', f.file, '→', f.error));
  }
})();
