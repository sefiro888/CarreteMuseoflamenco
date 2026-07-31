# Carrete de Málaga — Al compás de una vida

Museo digital de José Losada Santiago, «Carrete de Málaga». Proyecto impulsado por
su hijo, Bernardo Losada, con la colaboración de Paco Roji, como homenaje en vida
y archivo vivo que puede seguir ampliándose durante años.

Construido con [Astro](https://astro.build) + TypeScript estricto + React (solo para
los componentes que realmente lo necesitan) y colecciones de contenido en Markdown.
Es un sitio estático: no depende de ningún servicio externo para funcionar, y seguirá
funcionando aunque cambie el sistema con el que se edita el contenido.

## Cómo ejecutar la web en local

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre `http://localhost:4321`.

## Cómo construirla (build de producción)

```bash
npm run build
```

Esto ejecuta `astro check` (tipos) y después `astro build`. El resultado queda en `dist/`.
Para previsualizar ese build tal y como se serviría en producción:

```bash
npm run preview
```

## Cómo desplegarla

`dist/` es un sitio estático puro: puede desplegarse en Netlify, Vercel, GitHub Pages,
Cloudflare Pages o cualquier hosting estático, simplemente sirviendo esa carpeta tras
ejecutar `npm run build`. Antes de desplegar a producción real:

1. Actualiza `site` en [astro.config.mjs](astro.config.mjs) con el dominio definitivo
   (ahora mismo apunta a un dominio de ejemplo, `carretedemalaga.example`).
2. Actualiza la URL del `Sitemap:` en [public/robots.txt](public/robots.txt) a juego.

## Estructura del contenido

Todo el contenido editorial vive en `src/content/`, organizado en colecciones
definidas en [src/content.config.ts](src/content.config.ts). Cada colección es una
carpeta con archivos Markdown (`.md`): el frontmatter contiene los datos
estructurados y el cuerpo del archivo es el texto narrativo (cuando aplica).

Colecciones existentes: `timeline`, `people`, `stories`, `monotonas`, `performances`,
`awards`, `testimonials`, `media`, `places`, `sources`, `research-notes`.

### Los campos de procedencia (presentes en casi todas las colecciones)

- **`verification`**: `documented` (hecho documentado) · `testimony` (testimonio
  directo) · `oral-memory` (memoria oral de Carrete) · `approximate-date` (fecha
  aproximada) · `contradictory` (versión contradictoria) · `pending-research`
  (pista pendiente de investigación).
- **`sourceRefs`**: lista de ids de la colección `sources` que respaldan el dato.
- **`status`**: `draft` (borrador) · `review` (en revisión) · `published` (publicado).
  Solo cambia el contenido visible en el sitio en la práctica si tú decides filtrar
  por `status` en una página; de momento las páginas muestran todo el contenido de
  cada colección, así que usa `draft`/`review` como señal editorial para el equipo,
  no como un mecanismo técnico de ocultación (ver «Cómo mantener algo en borrador»).
- **`author`**, **`owner`**, **`publishPermission`**, **`credit`**: de dónde viene el
  material y si hay permiso explícito para publicarlo.
- **`lang`**: `es` por defecto; `en` está reservado para cuando exista contenido
  narrativo traducido de verdad (ver «Sobre el inglés», más abajo).

**Regla de oro: nunca subas la `verification` de una pieza a `documented` o
`testimony` sin una fuente real en `sourceRefs`.** Si no la tienes, dilo con
`pending-research` y añade una nota en el cuerpo del archivo explicando qué falta.

## Cómo añadir contenido

### Añadir una fotografía, vídeo, audio o documento

1. Sube el archivo real a donde vayas a alojar medios (este repositorio no incluye
   almacenamiento de archivos pesados; usa un CDN, un bucket, o `public/media/` para
   pruebas locales).
2. Crea un archivo en `src/content/media/tu-slug.md` con este frontmatter:

   ```md
   ---
   title: "Título descriptivo"
   type: photo # photo | video | audio | document
   dateApprox: "Años 60"
   placeRef: torremolinos # id de un archivo en src/content/places, opcional
   peopleRefs: [] # ids de src/content/people relacionadas, opcional
   verification: documented
   status: published
   owner: "Familia Losada" # quién es el titular del material
   publishPermission: true # solo true si hay permiso explícito
   credit: "Archivo familiar Losada"
   filePath: "/media/nombre-del-archivo.jpg"
   sourceRefs: []
   ---
   ```
3. Aparecerá automáticamente en `/archivo`, con buscador y filtros por tipo.

### Añadir una «monótona» (anécdota de Carrete)

1. Crea `src/content/monotonas/tu-slug.md`.
2. Completa como mínimo `title`, `summary`, `verification` y `status`.
3. Cuando exista grabación real: pon `videoAvailable: true`, añade `videoUrl`,
   `transcript` (transcripción literal) y, si existe, `translationEn` (traducción al
   inglés, sin sustituir la voz original — solo como apoyo de lectura).
4. Mientras no haya grabación, deja `videoAvailable: false`: la ficha se mostrará
   como «pendiente de incorporar», nunca como si el vídeo existiera.

### Añadir una persona

Crea `src/content/people/nombre-slug.md` con `name`, `role`, `relationToCarrete`,
`summary`, `verification` y `status`. Si no tienes datos verificados sobre su vínculo
con Carrete, dilo explícitamente en `relationToCarrete` (por ejemplo: `"Por
investigar"`) y usa `verification: pending-research`. Para vincular testimonios
suyos, crea una entrada en `src/content/testimonials/` con `personRef` apuntando
a su id.

**Nunca marques a alguien como colaborador confirmado del proyecto
(`confirmedCollaborator: true`) sin que exista contacto real y consentimiento.**
Ahora mismo solo Bernardo Losada y Paco Roji tienen ese campo en `true`.

### Añadir una actuación o espectáculo

Crea `src/content/performances/tu-slug.md` con `title`, `description`,
`verification` y `status`; `venue`, `dateExact` o `dateApprox` son opcionales.

### Registrar una fuente

Toda afirmación de tipo `documented` o `testimony` debe apoyarse en una fuente real.
Crea `src/content/sources/tu-slug.md`:

```md
---
title: "Título del artículo, libro o página"
sourceType: article # book | article | web | institutional | oral
authors: ["Nombre del autor o medio"]
year: "2024"
url: "https://..." # opcional si no es un enlace web
note: "Cualquier matiz sobre cómo usar esta fuente"
---
```

Todas las fuentes registradas aparecen automáticamente en `/creditos`.

### Cómo mantener algo en borrador

El campo `status` (`draft` / `review` / `published`) es la señal editorial, pero
las páginas actuales no filtran automáticamente por `status` — muestran todo el
contenido de cada colección. Si quieres que un elemento en `draft` no aparezca
todavía en el sitio público, la forma más simple es **no crear el archivo hasta que
esté listo para `review`**, o añadir manualmente un filtro `.filter(item =>
item.data.status !== 'draft')` en la página correspondiente cuando el volumen de
contenido lo justifique.

### Cómo indicar derechos y créditos

Usa siempre `owner` (quién es el titular), `publishPermission` (`true` solo con
permiso explícito) y `credit` (el texto de crédito exacto que debe mostrarse). Si
el material tiene alguna restricción de uso, añádela en `rightsNote` (colección
`media`).

## Sobre el inglés

La arquitectura bilingüe está preparada: diccionario de interfaz en
[src/lib/i18n.ts](src/lib/i18n.ts), `lang` en el esquema de contenido, rutas listas
para `/en/...`. Está desactivada en la navegación pública (`ENGLISH_ENABLED = false`
en `src/lib/i18n.ts`) porque **todavía no existe contenido narrativo traducido**, y
mostrar enlaces a páginas en inglés inexistentes sería peor que no mostrarlos.
Cuando haya traducciones reales y revisadas, crea las páginas en
`src/pages/en/...` y cambia esa constante a `true`.

## Contenido pendiente de aportar por Bernardo Losada y Paco Roji

- Fotografías y vídeos reales (portada, estatua, tablaos, archivo familiar).
- Grabación real de al menos una «monótona» con audio original.
- Confirmación de fechas exactas de los tablaos de Torremolinos (El Remo, El Pimpi,
  Gran Taberna Gitana, El Jaleo, Cuevas de la Alhambra, El Pez Espada, Los Tarantos,
  Rincón Flamenco de Pepe Carrete).
- Fuente publicada (o testimonio directo grabado) para las citas atribuidas a Rocío
  Molina, Paco de Lucía, Camarón de la Isla y Enrique Morente.
- Vínculo real y verificable de Carrete con el resto de maestros del flamenco
  listados en `/maestros` (Carmen Amaya, Antonio Gades, Farruco, etc.), hoy marcados
  como «por investigar».
- Vínculo real y verificable con las personalidades internacionales listadas en
  `/mundo`.
- Traducciones al inglés revisadas por un hablante nativo (ver «Sobre el inglés»).
- Autorización expresa de la familia y del ayuntamiento para usar cualquier
  fotografía de la estatua de Torremolinos.

## Datos pendientes de verificar (contradicciones y fechas abiertas)

Documentados como `research-notes` y visibles en `/creditos`:

- **Fecha de nacimiento** ([src/content/research-notes/fecha-nacimiento.md](src/content/research-notes/fecha-nacimiento.md)):
  hacia 1940–1941, sin partida de nacimiento confirmada.
- **Posible vínculo con Juan Domingo Perón** ([src/content/research-notes/version-peron.md](src/content/research-notes/version-peron.md)):
  existen versiones contradictorias; el sitio no elige ninguna.
- **Nota interna sobre una posible colaboración fotográfica futura**
  ([src/content/research-notes/colaboracion-fotografica-futura.md](src/content/research-notes/colaboracion-fotografica-futura.md)):
  ninguna persona en ese supuesto ha sido contactada; no debe aparecer en ningún
  lugar público del sitio como colaborador.

## Validaciones ejecutadas antes de esta entrega

- `astro check` (tipos de TypeScript + content collections): 0 errores.
- `astro build` (build de producción, 67 páginas estáticas): 0 errores.
- Comprobación automática de enlaces internos rotos sobre `dist/`: 0 encontrados
  (aparte del audio de portada, que está pendiente de subir a propósito y se
  gestiona con un mensaje explícito, nunca en silencio).
- Revisión manual en navegador: portada, mapa interactivo (con fallback en lista
  sin JavaScript), archivo con filtros y buscador, línea temporal, ficha de persona,
  monótona, y menú de navegación en móvil.
- Contraste de color de toda la paleta calculado contra WCAG AA: todos los pares
  texto/fondo usados superan 4.5:1 (la mayoría por encima de 7:1).
- `prefers-reduced-motion` respetado globalmente (variables de duración a 0 y
  desactivación de animaciones decorativas).

## Lo que todavía no se ha probado

- No se ha ejecutado un audit de Lighthouse real (requiere Chrome con DevTools
  Protocol accesible desde este entorno); la base de accesibilidad, rendimiento
  (assets autoalojados, sin fuentes ni scripts de terceros salvo los tiles de mapa
  bajo demanda) y SEO está cuidada, pero conviene correr Lighthouse tras el primer
  despliegue real.
- No hay pruebas automatizadas (unit/e2e); el proyecto es principalmente contenido
  estructurado y páginas de presentación, así que la validación principal ha sido
  `astro check` + build + revisión manual.
