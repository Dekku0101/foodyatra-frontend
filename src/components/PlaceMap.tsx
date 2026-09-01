import { useState, useRef, useEffect } from 'react';
import Map, { Marker, Popup, Source, Layer, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ExternalLink } from 'lucide-react';

export interface PlaceMapProps {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
  stops?: { name: string; lat: number; lng: number; highlightDish?: string }[];
  isTour?: boolean;
}

const PlaceMap = ({ lat: propLat, lng: propLng, latitude, longitude, name, address, stops, isTour }: PlaceMapProps) => {
  const mapRef = useRef<MapRef>(null);
  const effectiveLat = typeof propLat === 'number' && !isNaN(propLat) ? propLat : typeof latitude === 'number' && !isNaN(latitude) ? latitude : undefined;
  const effectiveLng = typeof propLng === 'number' && !isNaN(propLng) ? propLng : typeof longitude === 'number' && !isNaN(longitude) ? longitude : undefined;

  const defaultCenter: [number, number] = [73.1812, 22.3072]; // [lng, lat] for MapLibre
  const center: [number, number] = effectiveLat && effectiveLng ? [effectiveLng, effectiveLat] : defaultCenter;
  const validStops = stops?.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number' && !isNaN(s.lat) && !isNaN(s.lng)) ?? [];
  const polylinePositions = validStops.map(s => [s.lng, s.lat]);

  const [activePopup, setActivePopup] = useState<string | null>(null);

  // Auto-fit bounds or recenter
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    if (isTour && validStops.length > 1) {
      const minLng = Math.min(...validStops.map(s => s.lng));
      const maxLng = Math.max(...validStops.map(s => s.lng));
      const minLat = Math.min(...validStops.map(s => s.lat));
      const maxLat = Math.max(...validStops.map(s => s.lat));
      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 40, duration: 1000 });
    } else if (!isTour && effectiveLat && effectiveLng) {
      map.flyTo({ center: [effectiveLng, effectiveLat], zoom: 16, duration: 1000 });
    }
  }, [effectiveLat, effectiveLng, isTour, validStops]);

  // Always use name+address search format for best pin accuracy (DECISIONS.md D3).
  // Raw lat/lng links open a generic map pin with no place name/details.
  const googleMapsUrl =
    isTour && validStops.length > 0
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(validStops[0].name || name || 'Vadodara')}`
      : name && address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`
      : name
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, Vadodara`)}`
      : '#';

  const hasValidCoords = (!isTour && effectiveLat && effectiveLng) || (isTour && validStops.length > 0);

  if (!hasValidCoords) {
    return (
      <div className="rounded-2xl p-6 border border-white/10 bg-white/5 text-center space-y-2">
        <p className="text-sm font-semibold text-white">📍 Location coordinates not available</p>
        <p className="text-xs text-muted-foreground">Search on Google Maps for address details</p>
        {name && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ? `${name}, ${address}` : name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 mt-2 rounded-xl bg-primary text-black font-bold text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Search on Google Maps
          </a>
        )}
      </div>
    );
  }

  const mapStyleUrl = 'https://tiles.openfreemap.org/styles/dark'; // Dark style as requested
  // Optional: 'https://tiles.openfreemap.org/styles/liberty' for testing

  const geojson: any = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: polylinePositions
    }
  };

  return (
    <div className="space-y-4">
      {/* Map container */}
      <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: 320, position: 'relative' }}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: center[0],
            latitude: center[1],
            zoom: isTour ? 14 : 16
          }}
          mapStyle={mapStyleUrl}
          style={{ width: '100%', height: '100%' }}
          scrollZoom={false}
          attributionControl={true}
        >
          {/* Single location */}
          {!isTour && effectiveLat && effectiveLng && (
            <>
              <Marker
                longitude={effectiveLng}
                latitude={effectiveLat}
                anchor="bottom"
                onClick={e => {
                  e.originalEvent.stopPropagation();
                  setActivePopup('main');
                }}
              >
                <div style={{
                  width: '36px', height: '36px',
                  background: 'linear-gradient(135deg,#f97316,#ea580c)',
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  border: '3px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 12px rgba(249,115,22,0.6)',
                  cursor: 'pointer'
                }} />
              </Marker>
              
              {activePopup === 'main' && (
                <Popup
                  longitude={effectiveLng}
                  latitude={effectiveLat}
                  anchor="bottom"
                  offset={[0, -40]}
                  onClose={() => setActivePopup(null)}
                  closeOnClick={false}
                >
                  <div style={{ color: '#111', padding: '2px', maxWidth: '200px' }}>
                    <strong style={{ display: 'block', fontSize: '13px' }}>{name}</strong>
                    {address && <span style={{ fontSize: '11px', color: '#555', display: 'block', marginTop: '2px' }}>{address}</span>}
                  </div>
                </Popup>
              )}
            </>
          )}

          {/* Tour: polyline + numbered markers */}
          {isTour && validStops.length > 0 && (
            <>
              {polylinePositions.length > 1 && (
                <Source id="route" type="geojson" data={geojson}>
                  <Layer
                    id="route-line"
                    type="line"
                    layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                    paint={{ 'line-color': '#f97316', 'line-width': 3, 'line-dasharray': [2, 1] }}
                  />
                </Source>
              )}
              {validStops.map((stop, i) => (
                <div key={i}>
                  <Marker
                    longitude={stop.lng}
                    latitude={stop.lat}
                    anchor="center"
                    onClick={e => {
                      e.originalEvent.stopPropagation();
                      setActivePopup(`stop-${i}`);
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px',
                      background: 'linear-gradient(135deg,#f97316,#ea580c)',
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '13px', color: 'white',
                      boxShadow: '0 4px 12px rgba(249,115,22,0.5)',
                      cursor: 'pointer'
                    }}>
                      {i + 1}
                    </div>
                  </Marker>

                  {activePopup === `stop-${i}` && (
                    <Popup
                      longitude={stop.lng}
                      latitude={stop.lat}
                      anchor="bottom"
                      offset={[0, -20]}
                      onClose={() => setActivePopup(null)}
                      closeOnClick={false}
                    >
                      <div style={{ fontWeight: 700, color: '#111', maxWidth: '200px' }}>
                        Stop {i + 1}: {stop.name}
                        {stop.highlightDish && (
                          <div style={{ color: '#555', marginTop: 2, fontWeight: 400, fontSize: '12px' }}>
                            🍽 {stop.highlightDish}
                          </div>
                        )}
                      </div>
                    </Popup>
                  )}
                </div>
              ))}
            </>
          )}
        </Map>
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
