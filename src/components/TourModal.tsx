import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, IndianRupee, Navigation, Utensils, Star, Info, ShieldAlert, Calendar, Users, CheckCircle2 } from 'lucide-react';
import { SPRING_ENTRY } from '@/motion/motionPresets';
import { Tour } from './TourCard';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { paymentsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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

// Custom numbered icon for tour stops
const createStopIcon = (num: number) => L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #F59E0B; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${num}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

function TourMapEffect({ stops }: { stops: any[] }) {
    const map = useMap();
    useEffect(() => {
        if (stops && stops.length > 0) {
            const latLngs = stops.map(s => [s.lat, s.lng] as [number, number]);
            map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
        }
    }, [stops, map]);
    return null;
}

interface TourModalProps {
    tour: Tour | null;
    onClose: () => void;
    isOpen: boolean;
}

const TourModal = ({ tour, onClose, isOpen }: TourModalProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [booking, setBooking] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<string>('');
    const [participants, setParticipants] = useState<number>(1);

    const slots = (tour as any)?.slots || [
        { _id: 'slot-1', date: tour?.date || new Date(), startTime: '09:00 AM', capacity: 20, bookedSeats: 6, status: 'available' },
        { _id: 'slot-2', date: tour?.date || new Date(), startTime: '05:30 PM', capacity: 20, bookedSeats: 12, status: 'available' }
    ];

    useEffect(() => {
        if (slots.length > 0 && !selectedSlotId) {
            setSelectedSlotId(slots[0]._id);
        }
    }, [tour]);

    if (!isOpen || !tour) return null;

    const selectedSlot = slots.find((s: any) => s._id === selectedSlotId) || slots[0];
    const remainingSeats = selectedSlot ? Math.max(0, (selectedSlot.capacity || 20) - (selectedSlot.bookedSeats || 0)) : 10;
    const totalPrice = (tour.price || 499) * participants;

    const handleBookTour = async () => {
        try {
            setBooking(true);
            const res = await paymentsApi.createSession(tour._id, selectedSlotId, participants);
            if (res.success && res.data?.bookingId) {
                toast({ 
                    title: 'Reservation Confirmed!', 
                    description: `Booked for ${participants} participant(s). Ticket Code: ${res.data.ticketCode}` 
                });
                onClose();
                navigate(`/tickets/${res.data.bookingId}`);
            } else {
                toast({ 
                    title: 'Booking Error', 
                    description: res.error || 'Failed to complete reservation', 
                    variant: 'destructive' 
                });
            }
        } catch (err: any) {
            toast({ 
                title: 'Booking Error', 
                description: err.message || 'Something went wrong', 
                variant: 'destructive' 
            });
        } finally {
            setBooking(false);
        }
    };

    const center = tour?.stops?.[0] ? [tour.stops[0].lat, tour.stops[0].lng] as [number, number] : [22.3072, 73.1812] as [number, number];
    const pathCoordinates = tour?.stops ? tour.stops.map((s: any) => [s.lat, s.lng] as [number, number]) : [];

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
                    className="relative w-full max-w-6xl h-[92vh] bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row text-foreground"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Left Panel: Details & Booking Slot Selector */}
                    <div className="w-full md:w-5/12 h-full overflow-y-auto border-r border-white/10 bg-card/60 flex flex-col justify-between custom-scrollbar">
                        <div>
                            {/* Hero Image */}
                            <div className="relative h-56 w-full">
                                <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-black/40 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h2 className="text-2xl font-display font-bold text-white leading-tight">{tour.title}</h2>
                                    <div className="flex items-center gap-2 text-primary font-medium text-xs mt-1">
                                        <MapPin className="w-3.5 h-3.5" /> {tour.city || 'Vadodara'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <div>
                                        <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                                        <span className="text-[10px] text-muted-foreground block">Duration</span>
                                        <span className="font-bold text-xs text-foreground">{tour.duration || '3 Hours'}</span>
                                    </div>
                                    <div className="border-l border-white/10">
                                        <Utensils className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                                        <span className="text-[10px] text-muted-foreground block">Food Stops</span>
                                        <span className="font-bold text-xs text-foreground">{tour.stops?.length || 4} Spots</span>
                                    </div>
                                    <div className="border-l border-white/10">
                                        <IndianRupee className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                                        <span className="text-[10px] text-muted-foreground block">Per Person</span>
                                        <span className="font-bold text-xs text-foreground">₹{tour.price || 499}</span>
                                    </div>
                                </div>

                                {/* Slot Selection */}
                                <div>
                                    <h3 className="text-sm font-bold text-foreground mb-2.5 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" /> Select Tour Date & Time Slot
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {slots.map((s: any) => {
                                            const isSelected = selectedSlotId === s._id;
                                            const remaining = Math.max(0, (s.capacity || 20) - (s.bookedSeats || 0));

                                            return (
                                                <button
                                                    key={s._id}
                                                    type="button"
                                                    onClick={() => setSelectedSlotId(s._id)}
                                                    className={`p-3 rounded-2xl border text-left transition-all ${
                                                        isSelected
                                                            ? 'border-primary bg-primary/10 shadow-sm'
                                                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-foreground">{s.startTime || '10:00 AM'}</span>
                                                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                                        {new Date(s.date || tour.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                    <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                                        remaining <= 3 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                        {remaining} seats left
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Participant Counter */}
                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="text-xs font-bold text-foreground">Participants</p>
                                            <p className="text-[10px] text-muted-foreground">Max {remainingSeats} per booking</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setParticipants(prev => Math.max(1, prev - 1))}
                                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-foreground font-bold text-sm flex items-center justify-center"
                                        >
                                            -
                                        </button>
                                        <span className="text-sm font-bold text-foreground w-4 text-center">{participants}</span>
                                        <button
                                            onClick={() => setParticipants(prev => Math.min(remainingSeats, prev + 1))}
                                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-foreground font-bold text-sm flex items-center justify-center"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-primary" /> About this Food Walk
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-xs">
                                        {tour.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Booking Action Footer */}
                        <div className="p-5 border-t border-white/10 bg-card space-y-2 shrink-0">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Total for {participants} guest(s):</span>
                                <span className="text-lg font-black text-foreground">₹{totalPrice}</span>
                            </div>

                            <button
                                onClick={handleBookTour}
                                disabled={booking || remainingSeats <= 0}
                                className="w-full py-3.5 bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-lg hover:brightness-110 transition-all disabled:opacity-50 text-sm"
                            >
                                {booking ? 'Reserving Tour...' : `Reserve Now (₹${totalPrice})`}
                            </button>
                            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-primary" /> Free cancellation up to 24h before tour start
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Interactive Route Map */}
                    <div className="hidden md:block w-7/12 h-full relative bg-gray-900 z-0">
                        <MapContainer 
                            center={center} 
                            zoom={14} 
                            style={{ width: '100%', height: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {tour.stops?.map((stop: any, index: number) => (
                                <Marker 
                                    key={index} 
                                    position={[stop.lat, stop.lng]}
                                    icon={createStopIcon(index + 1)}
                                >
                                    <Popup>
                                        <div className="font-bold text-foreground">{stop.name}</div>
                                        <div className="text-xs text-primary">{stop.highlightDish}</div>
                                    </Popup>
                                </Marker>
                            ))}
                            {pathCoordinates.length > 0 && (
                                <Polyline positions={pathCoordinates} color="#F59E0B" weight={3} opacity={0.8} />
                            )}
                            <TourMapEffect stops={tour.stops || []} />
                        </MapContainer>
                        
                        {/* Map Overlay Info */}
                        <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl max-w-xs z-[400]">
                            <p className="text-[11px] text-muted-foreground">Meeting Landmark</p>
                            <p className="text-white font-bold text-xs flex items-center gap-1.5 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-primary" /> {tour.meetingPoint || "Raopura Tower, Vadodara"}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TourModal;
