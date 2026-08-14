/**
 * Comprime para web los vídeos cortos del archivo familiar y extrae un
 * fotograma de portada para cada uno.
 *
 * Los originales no se tocan: se lee de la carpeta de procedencia y se
 * escribe en `public/video/` (el vídeo) y `src/assets/video/` (el póster).
 *
 * Uso:  node scripts/ingest-video.cjs "<ruta de la carpeta original>"
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) {
  console.error('Falta la ruta de la carpeta original, o no existe.');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const VIDEO_OUT = path.join(ROOT, 'public', 'video');
const POSTER_OUT = path.join(ROOT, 'src', 'assets', 'video');

fs.mkdirSync(VIDEO_OUT, { recursive: true });
fs.mkdirSync(POSTER_OUT, { recursive: true });

// Solo los clips cortos. Las piezas largas (el documental de Eye Rise Films y
// el programa de radio) van a un servicio de vídeo aparte: no tiene sentido
// servirlas desde un sitio estático.
const CLIPS = [
  { file: 'Vídeo Rocío Molina.mp4', slug: 'rocio-molina' },
  { file: '2022.04.06 NY.mp4', slug: '2022-nueva-york' },
  { file: '2022.02.27_Aceitera.mp4', slug: '2022-aceitera' },
  { file: 'El manco junto a la aduana.mp4', slug: 'el-manco-junto-a-la-aduana' },
  { file: 'Postal.MP4', slug: 'postal' },
];

const MAX_WIDTH = 1280;

function run(args) {
  execFileSync(ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'] });
}

function probeDuration(input) {
  try {
    const out = execFileSync(ffmpeg, ['-hide_banner', '-i', input], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    return out.toString();
  } catch (e) {
    // ffmpeg sale con código != 0 cuando solo se le pide información.
    const text = e.stderr ? e.stderr.toString() : '';
    const m = text.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
    if (!m) return null;
    return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4]) / 100;
  }
}

const manifest = [];

for (const clip of CLIPS) {
  const input = path.join(SRC, clip.file);
  if (!fs.existsSync(input)) {
    console.log('  no encontrado, se omite:', clip.file);
    continue;
  }

  const duration = probeDuration(input);
  const outVideo = path.join(VIDEO_OUT, `${clip.slug}.mp4`);
  const outPoster = path.join(POSTER_OUT, `${clip.slug}.jpg`);

  process.stdout.write(`${clip.slug} … `);

  run([
    '-y',
    '-i', input,
    '-vf', `scale='min(${MAX_WIDTH},iw)':-2`,
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-crf', '25',
    '-preset', 'slow',
    // Permite que el navegador empiece a reproducir sin descargar el archivo entero.
    '-movflags', '+faststart',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ac', '2',
    outVideo,
  ]);

  // Fotograma de portada tomado a un cuarto de la duración: al principio
  // suele haber fundidos a negro o encuadres sin asentar.
  const at = duration ? Math.max(0.5, duration * 0.25) : 1;
  run([
    '-y',
    '-ss', String(at),
    '-i', input,
    '-frames:v', '1',
    '-vf', `scale='min(1280,iw)':-2`,
    '-q:v', '4',
    outPoster,
  ]);

  const bytes = fs.statSync(outVideo).size;
  manifest.push({
    slug: clip.slug,
    source: clip.file,
    video: `/video/${clip.slug}.mp4`,
    poster: `${clip.slug}.jpg`,
    durationSeconds: duration ? Math.round(duration) : null,
    bytes,
  });
  console.log(`${(bytes / 1e6).toFixed(1)} MB`);
}

fs.writeFileSync(
  path.join(__dirname, 'video-manifest.json'),
  JSON.stringify(manifest, null, 1),
);
console.log(`\nVídeos procesados: ${manifest.length}`);
