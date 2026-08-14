/**
 * Prefijo de despliegue.
 *
 * En local la web se sirve desde la raíz, pero en GitHub Pages vive dentro de
 * `/CarreteMuseoflamenco/`. Astro reescribe solo las imágenes importadas desde
 * `src/assets`; los enlaces escritos a mano y los ficheros de `public/` hay que
 * prefijarlos aquí.
 *
 * Uso: `url('/mapa')`, `url(room.slug)`, `url(item.filePath)`.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path: string): string {
  if (!path) return path;
  // Enlaces externos, anclas y correos se dejan intactos.
  if (/^([a-z]+:|\/\/|#)/i.test(path)) return path;
  if (!path.startsWith('/')) return path;
  return `${BASE}${path}` || '/';
}
