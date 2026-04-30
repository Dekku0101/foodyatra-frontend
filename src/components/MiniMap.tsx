import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface MiniMapProps {
    foodPlaces: any[];
    activePin?: number | string | null;
    label?: string;
}

const MiniMap = ({ foodPlaces, activePin, label }: MiniMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const [isMapReady, setIsMapReady] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const isConfigured = useRef(false);

    const initMap = async () => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                setMapError("API Key missing.");
                return;
            }

            if (!isConfigured.current) {
                console.log("Configuring Map...");
                try {
                    setOptions({
                        key: apiKey,
                        v: "weekly",
                        libraries: ["maps", "places", "marker"]
                    });
                    isConfigured.current = true;
                } catch (e) {
                    console.warn("Map options already set or failed:", e);
                }
            }

            console.log("Starting Map Load...");
            const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
            console.log("Map Library Loaded");

            if (mapRef.current && !googleMapRef.current) {
                googleMapRef.current = new Map(mapRef.current, {
                    center: { lat: 22.3072, lng: 73.1812 },
                    zoom: 13,
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "geometry",
                            stylers: [{ color: "#263c3f" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#6b9a76" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry",
                            stylers: [{ color: "#38414e" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#212a37" }],
                        },
                        {
                            featureType: "road",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#9ca5b3" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry",
                            stylers: [{ color: "#746855" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#1f2835" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#f3d19c" }],
                        },
                        {
                            featureType: "transit",
                            elementType: "geometry",
                            stylers: [{ color: "#2f3948" }],
                        },
                        {
                            featureType: "transit.station",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [{ color: "#17263c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#515c6d" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#17263c" }],
                        },
                    ],
                });
                setIsMapReady(true);
            }
        } catch (error: any) {
            console.error("Error initializing map:", error);
            setMapError(error?.message || "Failed to load map");
        }
    };

    useEffect(() => {
        initMap();
        return () => {
            if (markersRef.current) {
                markersRef.current.forEach(marker => marker.setMap(null));
                markersRef.current = [];
            }
            googleMapRef.current = null;
            setIsMapReady(false);
        };
    }, []); // Initialize once

    useEffect(() => {
        if (!googleMapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add new markers
        foodPlaces.forEach(place => {
            const marker = new google.maps.Marker({
                position: { lat: place.lat || 22.3072, lng: place.lng || 73.1812 },
                map: googleMapRef.current,
                title: place.name,
                animation: activePin === place.id ? google.maps.Animation.BOUNCE : null,
            });
            markersRef.current.push(marker);
        });

    }, [foodPlaces, activePin, isMapReady]);

    return (
        <div className="glass-card overflow-hidden h-[350px] lg:h-[450px]">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-card/50">
                <div className="flex items-center gap-3">
                    <div className="relative"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping opacity-75" /></div>
                    <div>
                        <span className="text-sm font-semibold">{label || "Vadodara Food Map"}</span>
                        <span className="text-xs text-muted-foreground ml-2">Live Updates</span>
                    </div>
                </div>
            </div>
            <div className="relative h-[calc(100%-64px)] bg-gradient-to-br from-secondary/60 to-secondary/30 overflow-hidden">
                {/* Map Container - pure DOM for Google Maps */}
                <div ref={mapRef} className="w-full h-full absolute inset-0" />

                {/* Loading/Error Overlay - React managed */}
                {!isMapReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                        <div className="text-muted-foreground text-center p-4">
                            <span>{mapError ? `Error: ${mapError}` : "Loading Map..."}</span>
                            {mapError && <span className="block text-xs text-red-400 mt-2">Check console for details</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MiniMap;
