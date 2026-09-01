import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues with Vite bundler
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MiniMapProps {
    foodPlaces: any[];
    activePin?: number | string | null;
    label?: string;
}

// Helper component to handle flying to active pin and invalidate size
function MapEffect({ foodPlaces, activePin }: { foodPlaces: any[], activePin?: number | string | null }) {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
    }, [map]);

    useEffect(() => {
        if (activePin) {
            const activePlace = foodPlaces.find(p => p.id === activePin || p._id === activePin);
            const lat = activePlace?.lat ?? activePlace?.latitude;
            const lng = activePlace?.lng ?? activePlace?.longitude;
            if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
                map.flyTo([lat, lng], 15, { duration: 1 });
            }
        }
    }, [activePin, foodPlaces, map]);
    return null;
}

const MiniMap = ({ foodPlaces, activePin, label }: MiniMapProps) => {
    // Only place markers for items with valid numeric coordinates
    const validPlaces = (foodPlaces || []).map(p => ({
        ...p,
        lat: typeof p.lat === 'number' ? p.lat : typeof p.latitude === 'number' ? p.latitude : undefined,
        lng: typeof p.lng === 'number' ? p.lng : typeof p.longitude === 'number' ? p.longitude : undefined,
    })).filter(p => typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng));

    return (
        <div className="glass-card overflow-hidden h-[350px] lg:h-[450px]">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-card/50 relative z-[400]">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping opacity-75" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold">{label || "Vadodara Food Map"}</span>
                        <span className="text-xs text-muted-foreground ml-2">Live Updates</span>
                    </div>
                </div>
            </div>
            <div className="relative h-[calc(100%-64px)] overflow-hidden bg-[#242f3e] z-0">
                <MapContainer 
                    center={[22.3072, 73.1812]} 
                    zoom={13} 
                    style={{ width: '100%', height: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {validPlaces.map(place => (
                        <Marker 
                            key={place.id || place.name} 
                            position={[place.lat, place.lng]}
                        >
                            <Popup>
                                <div className="text-black font-semibold">{place.name}</div>
                                {place.restaurant && <div className="text-gray-600 text-xs">{place.restaurant}</div>}
                            </Popup>
                        </Marker>
                    ))}
                    <MapEffect foodPlaces={validPlaces} activePin={activePin} />
                </MapContainer>
            </div>
        </div>
    );
};

export default MiniMap;
