import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

/**
 * En GitHub Pages el museo se sirve dentro de `/CarreteMuseoflamenco/`, así que
 * el build de producción necesita ese prefijo. En local se sirve desde la raíz.
 * Se controla con la variable PAGES=1, que activa el workflow de despliegue.
 */
const isPages = process.env.PAGES === '1';

export default defineConfig({
  site: isPages ? 'https://sefiro888.github.io' : 'https://carretedemalaga.example',
  base: isPages ? '/CarreteMuseoflamenco' : undefined,
  trailingSlash: 'never',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [react(), sitemap()],
  build: {
    format: 'directory',
  },
});
