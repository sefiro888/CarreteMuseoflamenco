import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker, Polyline } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { kindGroup, type MapPlace } from '../lib/map-types';

interface Props {
  places: MapPlace[];
}

type Scope = 'torremolinos' | 'mundo';

const SCOPE_VIEW: Record<Scope, { center: [number, number]; zoom: number }> = {
  torremolinos: { center: [36.6205, -4.4995], zoom: 15 },
  mundo: { center: [39.5, -20], zoom: 3 },
};

const PRECISION_LABEL: Record<MapPlace['precision'], string> = {
  exact: 'Ubicación exacta',
  street: 'Ubicación por calle',
  approximate: 'Ubicación aproximada',
};

/** Rótulo de años de actividad, con lo que se sepa de apertura y cierre. */
function activeYears(place: MapPlace): string | null {
  if (place.yearOpened && place.yearClosed) return `${place.yearOpened}–${place.yearClosed}`;
  if (place.yearOpened) return `Desde ${place.yearOpened}`;
  return place.dateRange;
}

export default function MapExplorer({ places }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const lineRef = useRef<Polyline | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);

  const [scope, setScope] = useState<Scope>('torremolinos');
  const [decade, setDecade] = useState<string>('all');
  const [showJourney, setShowJourney] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const decades = useMemo(() => {
    const set = new Set<string>();
    places.forEach((p) => p.decades.forEach((d) => set.add(d)));
    return [...set].sort();
  }, [places]);

  const visible = useMemo(
    () =>
      places.filter((p) => {
        if (p.scope !== scope) return false;
        if (decade === 'all') return true;
        return p.decades.includes(decade);
      }),
    [places, scope, decade],
  );

  const selected = useMemo(
    () => places.find((p) => p.id === selectedId) ?? null,
    [places, selectedId],
  );

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
    setPhotoIndex(0);
  }, []);

  // ---- Arranque del mapa ----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!containerRef.current) return;
      try {
        const L = (await import('leaflet')).default;
        if (cancelled || !containerRef.current) return;
        leafletRef.current = L;

        const map = L.map(containerRef.current, {
          scrollWheelZoom: false,
          zoomControl: true,
          attributionControl: true,
        }).setView(SCOPE_VIEW.torremolinos.center, SCOPE_VIEW.torremolinos.zoom);
        mapRef.current = map;

        // Mosaico oscuro: el mapa claro por defecto chocaba con el negro
        // cálido del museo y robaba todo el protagonismo a las fotografías.
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // ---- Marcadores ----
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    for (const place of visible) {
      const group = kindGroup(place.kind);
      const isSelected = place.id === selectedId;
      const icon = L.divIcon({
        className: 'map-pin-wrap',
        html: `<span class="map-pin map-pin--${group}${isSelected ? ' is-selected' : ''}${
          place.precision === 'approximate' ? ' is-approx' : ''
        }"><span class="map-pin__dot"></span><span class="map-pin__label">${place.name}</span></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([place.lat, place.lng], {
        icon,
        title: place.name,
        keyboard: true,
        alt: place.name,
      }).addTo(map);

      marker.on('click', () => select(place.id));
      marker.on('keypress', () => select(place.id));
      markersRef.current.set(place.id, marker);
    }

    if (visible.length) {
      const bounds = L.latLngBounds(visible.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: scope === 'torremolinos' ? 16 : 6 });
    }
  }, [visible, ready, selectedId, scope, select]);

  // ---- Recorrido cronológico ----
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !ready) return;

    lineRef.current?.remove();
    lineRef.current = null;

    if (!showJourney) return;

    const ordered = visible
      .filter((p) => p.journeyOrder !== null)
      .sort((a, b) => (a.journeyOrder ?? 0) - (b.journeyOrder ?? 0));
    if (ordered.length < 2) return;

    lineRef.current = L.polyline(
      ordered.map((p) => [p.lat, p.lng] as [number, number]),
      { color: '#b6783b', weight: 1.5, opacity: 0.75, dashArray: '5 7' },
    ).addTo(map);
  }, [showJourney, visible, ready]);

  // Al cambiar de escala, se deselecciona y se recoloca la vista.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    select(null);
    map.setView(SCOPE_VIEW[scope].center, SCOPE_VIEW[scope].zoom);
  }, [scope, ready, select]);

  const photos = selected?.photos ?? [];
  const photo = photos[photoIndex];

  return (
    <div className="mapx">
      <div className="mapx__controls">
        <div className="mapx__group" role="group" aria-label="Escala del mapa">
          <button
            type="button"
            className={`mapx__chip${scope === 'torremolinos' ? ' is-active' : ''}`}
            onClick={() => setScope('torremolinos')}
            aria-pressed={scope === 'torremolinos'}
          >
            La milla del tablao
          </button>
          <button
            type="button"
            className={`mapx__chip${scope === 'mundo' ? ' is-active' : ''}`}
            onClick={() => setScope('mundo')}
            aria-pressed={scope === 'mundo'}
          >
            De la Costa del Sol al mundo
          </button>
        </div>

        <div className="mapx__group" role="group" aria-label="Filtrar por década">
          <span className="mapx__label">Década</span>
          <button
            type="button"
            className={`mapx__chip mapx__chip--sm${decade === 'all' ? ' is-active' : ''}`}
            onClick={() => setDecade('all')}
            aria-pressed={decade === 'all'}
          >
            Todas
          </button>
          {decades.map((d) => (
            <button
              key={d}
              type="button"
              className={`mapx__chip mapx__chip--sm${decade === d ? ' is-active' : ''}`}
              onClick={() => setDecade(d)}
              aria-pressed={decade === d}
            >
              {d}s
            </button>
          ))}
        </div>

        <label className="mapx__toggle">
          <input
            type="checkbox"
            checked={showJourney}
            onChange={(e) => setShowJourney(e.target.checked)}
          />
          <span>Trazar el recorrido</span>
        </label>
      </div>

      <div className="mapx__stage">
        <div
          ref={containerRef}
          className="mapx__canvas"
          role="application"
          aria-label="Mapa de los lugares de Carrete"
        />

        <aside className="mapx__panel" aria-live="polite">
          {!selected && (
            <div className="mapx__empty">
              <p className="mapx__empty-title">
                {visible.length} {visible.length === 1 ? 'lugar' : 'lugares'}
                {decade !== 'all' && ` en los ${decade}s`}
              </p>
              <p>
                Pulsa cualquier punto del mapa para ver qué era, cuándo estuvo abierto y las
                fotografías que se conservan de allí.
              </p>
              <ul className="mapx__list">
                {visible.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => select(p.id)}>
                      <span className={`mapx__swatch mapx__swatch--${kindGroup(p.kind)}`} />
                      <span className="mapx__list-name">{p.name}</span>
                      {p.photoCount > 0 && <span className="mapx__count">{p.photoCount}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selected && (
            <div className="mapx__detail">
              <button className="mapx__back" type="button" onClick={() => select(null)}>
                ← Todos los lugares
              </button>

              <p className="mapx__kind">{selected.kind}</p>
              <h3 className="mapx__name">{selected.name}</h3>

              <p className="mapx__meta">
                {activeYears(selected) && <span>{activeYears(selected)}</span>}
                {selected.municipality && <span>{selected.municipality}</span>}
              </p>

              {photo && (
                <figure className="mapx__figure">
                  <img src={photo.thumb} alt={photo.alt} style={{ objectPosition: photo.focal }} />
                  <figcaption>
                    <span className="mapx__figure-title">{photo.title}</span>
                    <span className="mapx__figure-meta">
                      {photo.date}
                      {photo.credit && ` · ${photo.credit}`}
                    </span>
                  </figcaption>
                  {photos.length > 1 && (
                    <div className="mapx__figure-nav">
                      <button
                        type="button"
                        onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                        aria-label="Fotografía anterior"
                      >
                        ←
                      </button>
                      <span>
                        {photoIndex + 1} / {photos.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                        aria-label="Fotografía siguiente"
                      >
                        →
                      </button>
                    </div>
                  )}
                </figure>
              )}

              <p className="mapx__desc">{selected.description}</p>
              {selected.body.map((paragraph) => (
                <p className="mapx__desc" key={paragraph.slice(0, 40)}>
                  {paragraph}
                </p>
              ))}

              {selected.todayNote && (
                <p className="mapx__today">
                  <strong>Hoy:</strong> {selected.todayNote}
                </p>
              )}

              {selected.alsoPlayed.length > 0 && (
                <div className="mapx__also">
                  <p className="mapx__also-title">Por aquí pasaron también</p>
                  <p>{selected.alsoPlayed.join(' · ')}</p>
                </div>
              )}

              <p className="mapx__precision">{PRECISION_LABEL[selected.precision]}</p>

              <a className="mapx__link" href={`/lugares/${selected.id}`}>
                Ver la ficha completa
                {selected.photoCount > 0 &&
                  ` y las ${selected.photoCount} piezas del archivo`}
              </a>
            </div>
          )}
        </aside>
      </div>

      {failed && (
        <p className="mapx__error" role="status">
          El mapa no ha podido cargarse; puede que no haya conexión. La lista completa de
          lugares sigue disponible más abajo.
        </p>
      )}
    </div>
  );
}
