import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png?url';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url';

export interface MapPlace {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
  description: string;
  verification: string;
}

interface Props {
  places: MapPlace[];
}

export default function MapExplorer({ places }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [activePlace, setActivePlace] = useState<MapPlace | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current || places.length === 0) return;
      try {
        const L = (await import('leaflet')).default;
        if (cancelled || !containerRef.current) return;

        // Leaflet's default icon always prepends an auto-detected asset path
        // in front of iconUrl/shadowUrl; deleting the override makes it use
        // the absolute bundler-provided URLs as-is.
        delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: markerIcon,
          iconRetinaUrl: markerIcon2x,
          shadowUrl: markerShadow,
        });

        const map = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView([places[0].lat, places[0].lng], 4);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        const bounds: [number, number][] = [];
        places.forEach((place) => {
          const marker = L.marker([place.lat, place.lng]).addTo(map);
          marker.bindPopup(`<strong>${place.name}</strong><br/>${place.kind}`);
          marker.on('click', () => setActivePlace(place));
          bounds.push([place.lat, place.lng]);
        });

        if (bounds.length > 1) {
          map.fitBounds(bounds, { padding: [32, 32] });
        }
      } catch {
        if (!cancelled) setMapError(true);
      }
    }

    init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [places]);

  return (
    <div className="map-explorer">
      <div ref={containerRef} className="map-explorer__canvas" role="application" aria-label="Mapa de lugares de Carrete" />
      {mapError && (
        <p className="map-explorer__error" role="status">
          El mapa no ha podido cargarse (puede que no haya conexión a internet). La
          lista de lugares sigue disponible más abajo.
        </p>
      )}
      {activePlace && (
        <div className="map-explorer__detail" role="status" aria-live="polite">
          <h3>{activePlace.name}</h3>
          <p>{activePlace.kind}</p>
          <p>{activePlace.description}</p>
        </div>
      )}
    </div>
  );
}
