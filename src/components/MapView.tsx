// src/components/MapView.tsx
// Direct port — no react-router-dom dependency here, so nothing about
// the Astro migration required structural changes. Leaflet needs
// `window`/`document`, so this must run as a client island
// (client:visible — maps are typically below the fold and Leaflet is a
// heavier dependency, so deferring hydration until it scrolls into view
// avoids paying that cost on initial page load).

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Fix marker icons (same fix needed under Vite-powered Astro as under plain Vite) ---
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    description?: string;
  }>;
  height?: string;
  className?: string;
}

export default function MapView({
  center = [51.505, -0.09],
  zoom = 13,
  markers = [],
  height = 'h-80',
  className = '',
}: MapViewProps) {
  const displayMarkers = markers.length > 0 ? markers : [{ position: center, title: 'Location' }];

  return (
    <div className={`${height} w-full rounded-lg shadow overflow-hidden relative z-0 ${className}`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="h-full w-full z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {displayMarkers.map((marker, idx) => (
          <Marker key={idx} position={marker.position}>
            <Popup>
              <div className="text-sm">
                <strong>{marker.title}</strong>
                {marker.description && <p className="mt-1">{marker.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
