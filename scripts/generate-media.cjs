/**
 * Genera las fichas de la colección `media` a partir del archivo procesado.
 *
 * Los metadatos salen de los propios nombres de archivo que catalogó la
 * familia (fecha, lugar, personas, fotógrafo), que son la fuente primaria.
 * El script no inventa datos: lo que no consta en el nombre queda vacío o
 * marcado como pendiente.
 *
 * Es idempotente por defecto: no sobrescribe fichas ya existentes, para no
 * pisar correcciones hechas a mano. Con --force las regenera.
 *
 * Uso:  node scripts/generate-media.cjs [--force]
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const FORCE = process.argv.includes('--force');
const ROOT = path.join(__dirname, '..');
const MEDIA_DIR = path.join(ROOT, 'src', 'content', 'media');
const ASSET_DIR = path.join(ROOT, 'src', 'assets', 'archivo');
const PRESS_ASSET_DIR = path.join(ROOT, 'src', 'assets', 'hemeroteca');

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'archive-manifest.json'), 'utf8'),
);
const press = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'press-manifest.json'), 'utf8'),
);

const existingPlaces = new Set(
  fs.readdirSync(path.join(ROOT, 'src', 'content', 'places')).map((f) => f.replace(/\.md$/, '')),
);
const existingPeople = new Set(
  fs.readdirSync(path.join(ROOT, 'src', 'content', 'people')).map((f) => f.replace(/\.md$/, '')),
);

const PEOPLE = {
  'sean connery': 'sean-connery',
  'anthony quinn': 'anthony-quinn',
  quinn: 'anthony-quinn',
  'paco de lucía': 'paco-de-lucia',
  'paco de lucia': 'paco-de-lucia',
  farruco: 'farruco',
  sabicas: 'sabicas',
  'la repompa': 'la-repompa',
  repompa: 'la-repompa',
  cañeta: 'la-caneta',
  mariquilla: 'mariquilla',
  'pepito vargas': 'pepito-vargas',
  'los vargas': 'los-vargas',
  'la carreta': 'carmen-la-carreta',
  'rocío molina': 'rocio-molina',
  'alejandro sanz': 'alejandro-sanz',
  'manolo caracol': 'manolo-caracol',
  'la paquera': 'la-paquera',
  'paco del gastor': 'paco-del-gastor',
};

const PLACES = {
  'el refugio': 'el-refugio',
  'el pimpi': 'el-pimpi',
  pimpi: 'el-pimpi',
  'el remo': 'el-remo',
  montemar: 'el-remo',
  'el jaleo': 'el-jaleo',
  jaleo: 'el-jaleo',
  'bodega andaluza': 'bodega-andaluza',
  bodega: 'bodega-andaluza',
  'el mañana': 'el-manana',
  'cuevas de la alhambra': 'cuevas-alhambra',
  'cuevas flamencas': 'cuevas-alhambra',
  'pez espada': 'pez-espada',
  gtg: 'gran-taberna-gitana',
  'gran taberna gitana': 'gran-taberna-gitana',
  tabarin: 'tabarin-club',
  'pato pato': 'pato-pato',
  'pueblo blanco': 'pueblo-blanco',
  'café de chinitas': 'cafe-de-chinitas',
  'casa patas': 'casa-patas',
  'corral de la morería': 'corral-de-la-moreria',
  albéniz: 'teatro-albeniz',
  cervantes: 'teatro-albeniz',
  torremolinos: 'torremolinos',
  'nueva york': 'nueva-york',
  ny: 'nueva-york',
  londres: 'londres',
  'teatro real': 'teatro-real-madrid',
  sevilla: 'sevilla',
  jerez: 'jerez',
  barcelona: 'barcelona',
  marbella: 'marbella',
  noruega: 'noruega',
  madrid: 'madrid',
};

const CREDITS = [
  { re: /paco lobato/i, credit: 'Fotografía: Paco Lobato', owner: 'Paco Lobato' },
  { re: /aitor lara/i, credit: 'Fotografía: Aitor Lara', owner: 'Aitor Lara' },
  { re: /vicente pachón/i, credit: 'Fotografía: Vicente Pachón', owner: 'Vicente Pachón' },
  { re: /foto s\. ruiz/i, credit: 'Fotografía: S. Ruiz — cortesía de Gerardo Mongelli', owner: 'Gerardo Mongelli' },
  { re: /archivo paco roji/i, credit: 'Archivo Paco Roji', owner: 'Paco Roji' },
  { re: /gerardo mongelli|moguelli/i, credit: 'Cortesía de Gerardo Mongelli', owner: 'Gerardo Mongelli' },
  { re: /javier fergó/i, credit: 'Fotografía: Javier Fergó', owner: 'Javier Fergó' },
  { re: /rosaleny/i, credit: 'Fotografía: Manu Rosaleny', owner: 'Manu Rosaleny' },
  { re: /daphne pelet/i, credit: 'Postal Savir — cedida por Daphne Pelet', owner: 'Daphne Pelet' },
  { re: /paco sánchez/i, credit: 'Fotografía: Paco Sánchez', owner: 'Paco Sánchez' },
  { re: /pepe lópez/i, credit: 'Fotografía: Pepe López', owner: 'Pepe López' },
  { re: /bellido/i, credit: 'Fotografía: Manuel Bellido', owner: 'Manuel Bellido' },
  { re: /lorenzo carnero/i, credit: 'Fotografía: Lorenzo Carnero', owner: 'Lorenzo Carnero' },
  { re: /idígoras/i, credit: 'Caricatura: Idígoras', owner: 'Idígoras' },
  { re: /foto kyoko/i, credit: 'Fotografía: Kyoko', owner: 'Kyoko' },
  { re: /diario sur/i, credit: 'Diario Sur', owner: 'Diario Sur' },
];

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const MIN_YEAR = 1930;
const MAX_YEAR = 2030;
const plausible = (y) => y >= MIN_YEAR && y <= MAX_YEAR;

function parseDate(name) {
  let m = name.match(/^(\d{4})\.(\d{2})[.,](\d{2})/);
  if (m && plausible(+m[1])) return { iso: `${m[1]}-${m[2]}-${m[3]}`, precision: 'day' };
  m = name.match(/^(\d{4})\.(\d{2})(?!\d)/);
  if (m && plausible(+m[1])) return { iso: `${m[1]}-${m[2]}`, precision: 'month' };
  m = name.match(/^(\d{4})(\d{2})(\d{2})_/);
  if (m && plausible(+m[1])) return { iso: `${m[1]}-${m[2]}-${m[3]}`, precision: 'day' };
  m = name.match(/IMG[-_](\d{4})(\d{2})(\d{2})[-_]/i);
  if (m && plausible(+m[1])) return { iso: `${m[1]}-${m[2]}-${m[3]}`, precision: 'day' };
  m = name.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m && plausible(+m[1])) return { iso: `${m[1]}-${m[2]}-${m[3]}`, precision: 'day' };
  m = name.match(/^(\d{4})\s*[\s.\-]/);
  if (m && plausible(+m[1])) return { iso: m[1], precision: 'year' };
  return null;
}

function humanDate(d) {
  if (!d) return null;
  const [y, mo, da] = d.iso.split('-');
  if (d.precision === 'day') return `${+da} de ${MONTHS[+mo - 1]} de ${y}`;
  if (d.precision === 'month') return `${MONTHS[+mo - 1]} de ${y}`;
  return y;
}

function cleanTitle(base) {
  let t = base
    // fecha inicial en cualquiera de sus formatos (1975.09.25 / 1975-09-25 / 1975 09 25)
    .replace(/^\d{4}([.\-\s]\d{2}){0,2}[.\-\s]*/, '')
    // créditos y procedencia al final
    .replace(/[.,-]?\s*(Archivo|Cortesía|Cedida|Foto|Fotografía|Postal)\s+[^.]*$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\s*$/, '')
    .trim();
  if (!t || /^(img|image|whatsapp|p|\d+)$/i.test(t)) return null;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Texto alternativo. Conserva el título tal cual lo catalogó la familia
 * —con sus nombres propios— y añade soporte y fecha, que es lo que un
 * lector de pantalla necesita para situar la pieza.
 */
function buildAlt(kind, title, monochrome, when) {
  const soporte =
    kind === 'press'
      ? 'Recorte de prensa del archivo familiar'
      : `Fotografía ${monochrome ? 'en blanco y negro ' : ''}del archivo familiar`;
  return `${title}. ${soporte}${when ? `, ${when}` : ''}.`;
}

function detect(map, hay) {
  const out = new Set();
  for (const [needle, slug] of Object.entries(map)) {
    if (hay.includes(needle)) out.add(slug);
  }
  return [...out];
}

const yaml = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';

(async () => {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  let created = 0;
  let skipped = 0;

  // ---- Fotografías y carteles ----
  for (const entry of manifest) {
    if (entry.kind !== 'image') continue;
    const file = path.join(MEDIA_DIR, `${entry.slug}.md`);
    if (fs.existsSync(file) && !FORCE) {
      skipped++;
      continue;
    }

    const base = path.basename(entry.file, path.extname(entry.file));
    const lower = base.toLowerCase();
    const date = parseDate(base);
    const title = cleanTitle(base) || 'Fotografía del archivo familiar';
    const credit = CREDITS.find((c) => c.re.test(base));
    const people = detect(PEOPLE, lower).filter((p) => existingPeople.has(p));
    const places = detect(PLACES, lower).filter((p) => existingPlaces.has(p));

    // ¿Blanco y negro? Se mide la saturación real para no describir mal la imagen.
    let monochrome = false;
    try {
      const stats = await sharp(path.join(ASSET_DIR, entry.asset)).stats();
      if (stats.channels.length >= 3) {
        const [r, g, b] = stats.channels;
        const spread =
          Math.abs(r.mean - g.mean) + Math.abs(g.mean - b.mean) + Math.abs(r.mean - b.mean);
        monochrome = spread < 12;
      } else {
        monochrome = true;
      }
    } catch {
      /* si falla la medición se omite el matiz de color en el alt */
    }

    const when = humanDate(date);
    const alt = buildAlt('photo', title, monochrome, when);

    const isPortrait = entry.height > entry.width;

    const lines = [
      '---',
      `title: ${yaml(title)}`,
      'type: photo',
      `image: "../../assets/archivo/${entry.asset}"`,
      `alt: ${yaml(alt)}`,
      date && date.precision === 'day' ? `dateExact: ${yaml(date.iso)}` : null,
      date && date.precision !== 'day' ? `dateApprox: ${yaml(when)}` : null,
      places.length ? `placeRef: ${places[0]}` : null,
      people.length ? 'peopleRefs:' : null,
      ...people.map((p) => `  - ${p}`),
      `focal: ${yaml(isPortrait ? 'center 30%' : 'center')}`,
      'verification: documented',
      'status: published',
      `owner: ${yaml(credit ? credit.owner : 'Archivo familiar Losada')}`,
      'publishPermission: true',
      `credit: ${yaml(credit ? credit.credit : 'Archivo familiar Losada')}`,
      credit ? null : 'rightsNote: "Autoría concreta pendiente de identificar."',
      'sourceRefs:',
      '  - archivo-familiar-losada',
      '---',
      '',
    ].filter((l) => l !== null);

    fs.writeFileSync(file, lines.join('\n'));
    created++;
  }

  // ---- Recortes de prensa ----
  for (const item of press) {
    const file = path.join(MEDIA_DIR, `prensa-${item.slug}.md`);
    if (fs.existsSync(file) && !FORCE) {
      skipped++;
      continue;
    }
    const spaced = item.slug.replace(/-/g, ' ');
    const date = parseDate(item.slug.replace(/-/g, '.'));
    const title = cleanTitle(spaced) || 'Recorte de prensa';
    const when = humanDate(date);
    const lower = spaced;
    const places = detect(PLACES, lower).filter((p) => existingPlaces.has(p));
    const people = detect(PEOPLE, lower).filter((p) => existingPeople.has(p));

    const lines = [
      '---',
      `title: ${yaml(title)}`,
      'type: press',
      `image: "../../assets/hemeroteca/${item.preview}"`,
      `alt: ${yaml(buildAlt('press', title, false, when))}`,
      `filePath: ${yaml(item.pdf)}`,
      `pages: ${item.pages}`,
      date && date.precision === 'day' ? `dateExact: ${yaml(date.iso)}` : null,
      date && date.precision !== 'day' ? `dateApprox: ${yaml(when)}` : null,
      places.length ? `placeRef: ${places[0]}` : null,
      people.length ? 'peopleRefs:' : null,
      ...people.map((p) => `  - ${p}`),
      'focal: "center top"',
      'verification: documented',
      'status: published',
      'owner: "Archivo familiar Losada / Paco Roji"',
      'publishPermission: true',
      'credit: "Recorte conservado en el archivo familiar"',
      'rightsNote: "Cabecera y fecha exactas del diario pendientes de confirmar en algunos recortes."',
      'sourceRefs:',
      '  - archivo-familiar-losada',
      '---',
      '',
    ].filter((l) => l !== null);

    fs.writeFileSync(file, lines.join('\n'));
    created++;
  }

  console.log(`Fichas creadas: ${created} | respetadas (ya existían): ${skipped}`);
})();
