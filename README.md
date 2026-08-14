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

Esto ejecuta `astro check` (tipos), después `astro build` y por último una poda de
assets sin usar. El resultado queda en `dist/`. Para previsualizar ese build tal y
como se serviría en producción:

```bash
npm run preview
```

> **Sobre la poda:** Astro copia a `dist/_astro/` el original de cada imagen
> importada por las colecciones de contenido, aunque las páginas solo usen las
> variantes optimizadas. Con más de doscientas fotografías eso son unos 60 MB que
> ningún navegador llega a pedir. `scripts/prune-unused-assets.cjs` los elimina
> comprobando antes que su nombre no aparezca en ningún HTML, CSS, JS, JSON ni XML
> generado.

## Cómo desplegarla

`dist/` es un sitio estático puro: puede desplegarse en Netlify, Vercel, GitHub Pages,
Cloudflare Pages o cualquier hosting estático, simplemente sirviendo esa carpeta tras
ejecutar `npm run build`. Antes de desplegar a producción real:

1. Actualiza `site` en [astro.config.mjs](astro.config.mjs) con el dominio definitivo
   (ahora mismo apunta a un dominio de ejemplo, `carretedemalaga.example`).
2. Actualiza la URL del `Sitemap:` en [public/robots.txt](public/robots.txt) a juego.

## El archivo real y cómo volver a ingerirlo

En agosto de 2026 se incorporó el archivo cedido por Bernardo Losada y Paco Roji:
**191 fotografías** desde 1953, **43 recortes de prensa** y **5 vídeos cortos**.
Los scripts de `scripts/` dejan esa ingesta reproducible, por si en el futuro hay
que rehacerla o ampliarla con material nuevo. Todos leen de una carpeta de origen
y **nunca la modifican**.

```bash
# 1. Fotografías y PDFs de prensa
node scripts/ingest-archive.cjs "<ruta de la carpeta con el material original>"

# 2. Vistas previas de los recortes de prensa
node scripts/render-press.cjs

# 3. Vídeos cortos comprimidos y sus fotogramas de portada
node scripts/ingest-video.cjs "<misma ruta>"

# 4. Fichas de la colección media (no pisa las existentes; --force las regenera)
node scripts/generate-media.cjs
```

Qué hace cada uno:

- **`ingest-archive.cjs`** — normaliza las imágenes a 2000 px de lado máximo y las
  deja en `src/assets/archivo/`; copia los PDFs a `public/hemeroteca/`. Descarta
  duplicados exactos comparando el contenido, no el nombre.
- **`render-press.cjs`** — extrae el mapa de bits que el escáner incrustó en cada
  PDF, en vez de rasterizar la página. Los recortes son escaneos bilevel a mucha
  resolución y rasterizarlos los degradaba.
- **`ingest-video.cjs`** — comprime a H.264 con `faststart` y saca un fotograma de
  portada del primer cuarto del clip, donde ya no hay fundidos ni encuadres sin
  asentar.
- **`generate-media.cjs`** — crea una ficha por pieza leyendo los metadatos que la
  propia familia dejó en los nombres de archivo (fecha, lugar, personas, fotógrafo)
  y mide la saturación real de cada imagen para no describir como «blanco y negro»
  algo que está en color. Es idempotente: **no sobrescribe fichas ya existentes**,
  así que las correcciones hechas a mano sobreviven.

Los scripts requieren `sharp` (ya es dependencia), y además `pdfjs-dist` para la
prensa y `ffmpeg-static` para el vídeo. Estos dos últimos solo hacen falta para la
ingesta, así que se instalan sin guardarlos en el proyecto:

```bash
npm install --no-save pdfjs-dist@4 ffmpeg-static
```

### Material grande que no se sirve desde aquí

El archivo original incluye un documental de 721 MB (Ana González, Eye Rise Films)
y un programa de radio de 116 MB. No tiene sentido servirlos desde un sitio
estático: quedan pendientes de subir a un servicio de vídeo o audio y de enlazarlos
como cualquier otra ficha.

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

### Añadir una fotografía

1. Deja la imagen en `src/assets/archivo/`. No hace falta optimizarla a mano: Astro
   genera las variantes responsive en WebP. Sí conviene que no pase de unos 2000 px
   de lado, que es a lo que normaliza el script de ingesta.
2. Crea `src/content/media/tu-slug.md`:

   ```md
   ---
   title: "Título descriptivo"
   type: photo # photo | press | video | audio | document | object
   image: "../../assets/archivo/tu-slug.jpg"
   alt: "Qué se ve en la imagen, para quien no puede verla."
   dateExact: "1967-05-12"   # o dateApprox: "Años sesenta"
   placeRef: el-jaleo        # id de un archivo en src/content/places, opcional
   peopleRefs:               # ids de src/content/people, opcional
     - mariquilla
   focal: "center 30%"       # recorte de la tarjeta, sintaxis de object-position
   featured: false           # true para la selección destacada
   verification: documented
   status: published
   owner: "Familia Losada"   # quién es el titular del material
   publishPermission: true   # solo true si hay permiso explícito
   credit: "Fotografía: …"   # el crédito exacto que debe verse
   sourceRefs:
     - archivo-familiar-losada
   ---
   ```
3. Aparece automáticamente en `/archivo`, con buscador, filtros y visor ampliado.
   Si lleva `peopleRefs`, aparece también en la ficha de cada una de esas personas.

**`alt` importa.** Es lo que oye quien navega con lector de pantalla. Describe la
escena, no repitas el título en seco.

**`focal` es el recorte, no una edición.** La tarjeta muestra la foto en 4:3; el
punto focal decide qué parte se ve. La imagen completa se conserva siempre y es la
que aparece en el visor ampliado.

### Añadir un recorte de prensa

Igual que una fotografía, con `type: press`, la vista previa en
`src/assets/hemeroteca/` y el PDF original en `public/hemeroteca/` referenciado
desde `filePath`. Aparece en `/hemeroteca` y en `/archivo`, y el visor ofrece el
enlace de descarga del PDF.

### Añadir un vídeo o un audio

Comprime el archivo (o pásalo por `scripts/ingest-video.cjs`), déjalo en
`public/video/` y su fotograma de portada en `src/assets/video/`. Luego una ficha
con `type: video`, `filePath` apuntando al MP4 e `image` al póster. En el archivo
se reproduce dentro del propio visor.

### Añadir una «monótona» (anécdota de Carrete)

1. Crea `src/content/monotonas/tu-slug.md`.
2. Completa como mínimo `title`, `summary`, `verification` y `status`.
3. Cuando exista grabación real: pon `videoAvailable: true` y añade `videoUrl`
   (ruta en `public/video/`), `poster` (fotograma en `src/assets/video/`) y
   `durationSeconds`.
4. Añade `transcript` con la transcripción **literal** en cuanto la tengas, y
   `translationEn` si hay traducción (como apoyo de lectura, nunca sustituyendo su
   voz). Mientras no haya transcripción, la ficha lo dice abiertamente: el museo no
   pone por escrito lo que Carrete cuenta hasta haberlo transcrito de verdad.
5. Mientras no haya grabación, deja `videoAvailable: false`: la ficha se mostrará
   como «pendiente de incorporar», nunca como si el vídeo existiera.

Ejemplo real ya publicado:
[el-manco-junto-a-la-aduana.md](src/content/monotonas/el-manco-junto-a-la-aduana.md).

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

Lo más urgente, por orden de impacto:

1. **Transcribir el vídeo de Rocío Molina** que ya está en el archivo. Es el paso
   que puede convertir en testimonio verificado la cita más repetida sobre Carrete
   («Tú eres más contemporáneo que yo»), hoy todavía sin fuente.
2. **Transcribir y subtitular «El manco junto a la aduana»**, la primera monótona
   grabada que se ha publicado. Hasta que exista transcripción, el museo no
   reproduce por escrito lo que cuenta.
3. **Grabar más monótonas** con audio original, que es el corazón de la sala.
4. **Precisar fechas y autorías**: 30 piezas del archivo no tienen fecha en el
   nombre y buena parte del material antiguo carece de fotógrafo identificado.
   Aparecen acreditadas al archivo familiar y marcadas como pendientes de atribuir.
5. **Confirmar la cabecera y la fecha exacta** de los recortes de prensa que solo
   traen día y mes.
6. Fuente publicada para las citas atribuidas a **Paco de Lucía, Camarón de la Isla
   y Enrique Morente** (la de Rocío Molina, ver punto 1).
7. Vínculo real y verificable con los maestros que siguen marcados como «por
   investigar» en `/maestros` y con las personalidades internacionales de `/mundo`.
8. **Traducciones al inglés** revisadas por un hablante nativo (ver «Sobre el inglés»).
9. Subir a un servicio de vídeo el **documental de Eye Rise Films** y el programa
   de radio, demasiado pesados para un sitio estático.

## Datos pendientes de verificar (contradicciones y fechas abiertas)

Documentados como `research-notes` y visibles en `/creditos`:

- **Fecha de nacimiento** ([fecha-nacimiento.md](src/content/research-notes/fecha-nacimiento.md)):
  hacia 1940–1941, sin partida de nacimiento confirmada.
- **Posible vínculo con Juan Domingo Perón** ([version-peron.md](src/content/research-notes/version-peron.md)):
  existen versiones contradictorias; el sitio no elige ninguna.
- **La frase de Rocío Molina** ([cita-rocio-molina.md](src/content/research-notes/cita-rocio-molina.md)):
  sigue sin fuente publicada, pero ahora hay una vía concreta para resolverla.

### Lo que el archivo sí ha permitido documentar

La incorporación del material cerró varias incógnitas que antes estaban abiertas.
Estas fichas pasaron de «pendiente de investigación» a «hecho documentado», siempre
acotando qué prueba exactamente cada imagen:

| Ficha | Qué lo documenta |
| --- | --- |
| Sean Connery | Fotografía de grupo en El Pimpi, hacia 1957 |
| Anthony Quinn | Dos fotografías en La Bodega Andaluza, 1959 y 1960 |
| Farruco | Fotografía en El Jaleo, segunda mitad de los sesenta |
| Sabicas | Fotografía en El Jaleo, 1967 |
| Paco de Lucía | Fotografía en Starlite Marbella, 2013 |
| Chiquito de la Calzada | Programa compartido de 1953 |
| Viaje a Noruega | Recorte «Embajada flamenca a Noruega», enero de 1969 |

Importante: una fotografía prueba **un encuentro**, no una amistad ni una
colaboración. Cada ficha lo dice con esas palabras y deja anotado lo que sigue sin
saberse.

## Validaciones ejecutadas antes de esta entrega

- `astro check` (tipos de TypeScript + content collections): 0 errores.
- `astro build` (build de producción, **74 páginas estáticas**): 0 errores.
- Comprobación automática de enlaces internos rotos sobre `dist/`: 0 encontrados
  (aparte del audio de portada, que está pendiente de subir a propósito y se
  gestiona con un mensaje explícito, nunca en silencio).
- Poda de assets: 748 referencias a `/_astro/` comprobadas tras la limpieza, 0 rotas.
- Revisión manual en navegador, en escritorio y en móvil: portada, archivo con
  buscador y filtros por tipo y década, visor ampliado (ratón y teclado), línea
  temporal con fotografías, hemeroteca, ficha de persona, monótona con vídeo,
  comparador «antes y ahora» y mapa interactivo.
- Contraste de color de toda la paleta calculado contra WCAG AA: todos los pares
  texto/fondo usados superan 4.5:1 (la mayoría por encima de 7:1).
- `prefers-reduced-motion` respetado globalmente (variables de duración a 0 y
  desactivación de animaciones decorativas).
- Vídeo sin reproducción automática y con `preload="none"`: no se descarga hasta
  que alguien lo pide.

## Lo que todavía no se ha probado

- No se ha ejecutado un audit de Lighthouse real (requiere Chrome con DevTools
  Protocol accesible desde este entorno); la base de accesibilidad, rendimiento
  (assets autoalojados, sin fuentes ni scripts de terceros salvo los tiles de mapa
  bajo demanda) y SEO está cuidada, pero conviene correr Lighthouse tras el primer
  despliegue real.
- No hay pruebas automatizadas (unit/e2e); el proyecto es principalmente contenido
  estructurado y páginas de presentación, así que la validación principal ha sido
  `astro check` + build + revisión manual.
