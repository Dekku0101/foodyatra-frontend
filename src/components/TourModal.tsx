import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, IndianRupee, Navigation, Utensils, Star, Info } from 'lucide-react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { SPRING_ENTRY } from '@/motion/motionPresets';
import { Tour } from './TourCard';

interface TourModalProps {
    tour: Tour | null;
    onClose: () => void;
    isOpen: boolean;
}

const TourModal = ({ tour, onClose, isOpen }: TourModalProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);



    useEffect(() => {
        if (isOpen && tour && mapRef.current) {
            initMap();
        }
    }, [isOpen, tour]);

    const initMap = async () => {
        try {
            setOptions({
                key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
                v: 'weekly',
                libraries: ['places']
            });

            await importLibrary("maps");
            await importLibrary("places");

            // Access google from global scope after loading
            const google = window.google;
            const Map = google.maps.Map;

            // Center map on the first stop or default to Vadodara
            const center = tour?.stops?.[0] ? { lat: tour.stops[0].lat, lng: tour.stops[0].lng } : { lat: 22.3072, lng: 73.1812 };

            const mapInstance = new Map(mapRef.current!, {
                center: center,
                zoom: 14,
                mapId: 'DEMO_MAP_ID', // Use a valid Map ID if available, or remove for standard map
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                ],
                disableDefaultUI: true,
                zoomControl: true,
            });

            setMap(mapInstance);

            if (tour?.stops && tour.stops.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                const pathCoordinates: google.maps.LatLngLiteral[] = [];

                tour.stops.forEach((stop, index) => {
                    const position = { lat: stop.lat, lng: stop.lng };
                    pathCoordinates.push(position);
                    bounds.extend(position);

                    // Marker
                    new google.maps.Marker({
                        position: position,
                        map: mapInstance,
                        title: stop.name,
                        label: {
                            text: (index + 1).toString(),
                            color: 'white',
                            fontWeight: 'bold'
                        },
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 14,
                            fillColor: '#F59E0B', // Amber-500
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: '#FFFFFF',
                        }
                    });
                });

                // Draw Polyline Route
                const flightPath = new google.maps.Polyline({
                    path: pathCoordinates,
                    geodesic: true,
                    strokeColor: '#F59E0B',
                    strokeOpacity: 0.8,
                    strokeWeight: 3,
                });

                flightPath.setMap(mapInstance);
                mapInstance.fitBounds(bounds);
            }

        } catch (e) {
            console.error('Error loading map:', e);
        }
    };

    if (!isOpen || !tour) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={SPRING_ENTRY}
                    className="relative w-full max-w-6xl h-[90vh] bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Left Panel: Details */}
                    <div className="w-full md:w-1/3 h-full overflow-y-auto border-r border-white/5 bg-card/50">
                        {/* Hero Image */}
                        <div className="relative h-64 w-full">
                            <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <h2 className="text-3xl font-display font-bold text-white mb-2 leading-tight">{tour.title}</h2>
                                <div className="flex items-center gap-2 text-primary font-medium">
                                    <MapPin className="w-4 h-4" /> {tour.city}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex flex-col items-center text-center">
                                    <Clock className="w-5 h-5 text-amber-500 mb-1" />
                                    <span className="text-xs text-gray-400">Duration</span>
                                    <span className="font-bold text-white">{tour.duration}</span>
                                </div>
                                <div className="flex flex-col items-center text-center border-l border-white/10">
                                    <Utensils className="w-5 h-5 text-amber-500 mb-1" />
                                    <span className="text-xs text-gray-400">Stops</span>
                                    <span className="font-bold text-white">{tour.stops?.length || 0}</span>
                                </div>
                                <div className="flex flex-col items-center text-center border-l border-white/10">
                                    <IndianRupee className="w-5 h-5 text-amber-500 mb-1" />
                                    <span className="text-xs text-gray-400">Price</span>
                                    <span className="font-bold text-white">{tour.price}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" /> About this Tour
                                </h3>
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    {tour.description}
                                </p>
                            </div>

                            {/* Stops Timeline */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Navigation className="w-5 h-5 text-primary" /> Itinerary
                                </h3>
                                <div className="space-y-6 relative pl-4 border-l-2 border-white/10 ml-2">
                                    {tour.stops?.map((stop, index) => (
                                        <div key={index} className="relative pl-6 group">
                                            {/* Dot */}
                                            <span className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-card border-2 border-primary group-hover:bg-primary transition-colors" />

                                            <h4 className="font-bold text-white text-lg">{stop.name}</h4>
                                            <p className="text-primary text-sm font-medium mb-1 flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-primary" /> Must Try: {stop.highlightDish}
                                            </p>
                                            <p className="text-gray-400 text-xs leading-relaxed">
                                                {stop.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action */}
                            <div className="pt-4 sticky bottom-0 bg-[#1a1a1a] pb-4">
                                <button className="w-full py-4 bg-gradient-to-r from-primary to-amber-600 text-white font-bold rounded-xl shadow-premium hover:shadow-card-glow-hover transition-all transform hover:scale-[1.02]">
                                    Book Tour Now
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Right Panel: Map */}
                    <div className="hidden md:block w-2/3 h-full relative bg-gray-900">
                        <div ref={mapRef} className="w-full h-full" />
                        {/* Map Overlay Info */}
                        <div className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl max-w-xs">
                            <p className="text-xs text-gray-300 mb-1">Meeting Point</p>
                            <p className="text-white font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" /> {tour.meetingPoint || "City Center"}
                            </p>
                        </div>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TourModal;
