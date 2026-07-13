import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink } from 'lucide-react';

// Custom orange branded marker (teardrop shape)
const orangeIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid rgba(255,255,255,0.9);box-shadow:0 4px 12px rgba(249,115,22,0.6);"></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38],
});

// Numbered stop markers for tour routes
const makeNumberedIcon = (n: number) =>
  new L.DivIcon({
    className: '',
    html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:50%;border:2px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:white;box-shadow:0 4px 12px rgba(249,115,22,0.5);">${n}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });

// Re-center map when props change
const MapRecenterer = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Fit bounds to all tour stops
const TourBoundsFitter = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
};

export interface PlaceMapProps {
  lat?: number;
  lng?: number;
  name?: string;
  stops?: { name: string; lat: number; lng: number; highlightDish?: string }[];
  isTour?: boolean;
}

const PlaceMap = ({ lat, lng, name, stops, isTour }: PlaceMapProps) => {
  const defaultCenter: [number, number] = [22.3072, 73.1812]; // Vadodara
  const center: [number, number] = lat && lng ? [lat, lng] : defaultCenter;
  const validStops = stops?.filter(s => s.lat && s.lng) ?? [];
  const polylinePositions: [number, number][] = validStops.map(s => [s.lat, s.lng]);

  const googleMapsUrl =
    isTour && validStops.length > 0
      ? `https://www.google.com/maps?q=${validStops[0].lat},${validStops[0].lng}`
      : lat && lng
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : '#';

  return (
    <div className="space-y-4">
      {/* Map container */}
      <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: 320 }}>
        <MapContainer
          center={center}
          zoom={isTour ? 14 : 15}
          style={{ width: '100%', height: '100%' }}
          zoomControl
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Single location */}
          {!isTour && lat && lng && (
            <>
              <MapRecenterer center={[lat, lng]} zoom={15} />
              <Marker position={[lat, lng]} icon={orangeIcon}>
                <Popup>
                  <strong style={{ color: '#111' }}>{name}</strong>
                </Popup>
              </Marker>
            </>
          )}

          {/* Tour: polyline + numbered markers */}
          {isTour && validStops.length > 0 && (
            <>
              <TourBoundsFitter positions={polylinePositions} />
              {polylinePositions.length > 1 && (
                <Polyline
                  positions={polylinePositions}
                  pathOptions={{ color: '#f97316', weight: 3, opacity: 0.85, dashArray: '6 4' }}
                />
              )}
              {validStops.map((stop, i) => (
                <Marker key={i} position={[stop.lat, stop.lng]} icon={makeNumberedIcon(i + 1)}>
                  <Popup>
                    <div style={{ fontWeight: 700, color: '#111' }}>
                      Stop {i + 1}: {stop.name}
                    </div>
                    {stop.highlightDish && (
                      <div style={{ color: '#555', marginTop: 2 }}>🍽 {stop.highlightDish}</div>
                    )}
                  </Popup>
                </Marker>
              ))}
            </>
          )}
        </MapContainer>
      </div>

      {/* Open in Google Maps */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all text-sm group"
      >
        <ExternalLink className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
        Open in Google Maps
      </a>
    </div>
  );
};

export default PlaceMap;
