import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Clock, ArrowRight, Star, IndianRupee, Users, 
  Sparkles, Flame, Coffee, Moon, Heart, Leaf, Calendar 
} from 'lucide-react';
import { SPRING_HOVER, SPRING_TAP, SPRING_ENTRY } from '../motion/motionPresets';

export interface TourStop {
    name: string;
    highlightDish: string;
    description?: string;
    lat: number;
    lng: number;
    timeSpent?: string;
    walkingTimeToNext?: string;
}

export interface TourSlot {
    _id?: string;
    date: string | Date;
    startTime: string;
    capacity: number;
    bookedSeats: number;
    status: string;
}

export interface Tour {
    _id: string;
    title: string;
    city: string;
    category?: string;
    image: string;
    price: number;
    rating?: number;
    duration: string;
    distance?: string;
    difficulty?: string;
    meetingPoint?: string;
    stops: TourStop[];
    description: string;
    includes?: string[];
    whatToBring?: string[];
    rules?: string[];
    cancellationPolicy?: string;
    isAdminFeatured?: boolean;
    slots?: TourSlot[];
}

interface TourCardProps {
    tour: Tour;
    onViewDetails: () => void;
    onBookNow?: () => void;
}

export const getTourCategoryMeta = (category?: string) => {
    switch (category) {
        case 'Heritage Walk':
            return { label: 'Heritage Walk', icon: Sparkles, badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
        case 'Night Food':
            return { label: 'Night Food', icon: Moon, badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
        case 'Gujarati Cuisine':
            return { label: 'Gujarati Cuisine', icon: Leaf, badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
        case 'Cafe Trail':
            return { label: 'Cafe Trail', icon: Coffee, badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
        case 'Sweet Trail':
            return { label: 'Sweet Trail', icon: Heart, badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
        case 'Vegetarian':
            return { label: 'Satvik / Vegetarian', icon: Leaf, badgeStyle: 'bg-green-500/20 text-green-300 border-green-500/40' };
        case 'Street Food':
            return { label: 'Street Food', icon: Flame, badgeStyle: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
        default:
            return { label: category || 'Guided Food Walk', icon: Sparkles, badgeStyle: 'bg-primary/20 text-primary border-primary/40' };
    }
};

const TourCard = memo(({ tour, onViewDetails, onBookNow }: TourCardProps) => {
    const categoryMeta = getTourCategoryMeta(tour.category);
    const CategoryIcon = categoryMeta.icon;

    // Find next available slot
    const nextSlot = tour.slots?.find(s => s.status === 'available' && (s.capacity - s.bookedSeats) > 0);
    const remainingSeats = nextSlot ? (nextSlot.capacity - nextSlot.bookedSeats) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={SPRING_ENTRY}
            viewport={{ once: true }}
            whileHover={{ y: -6, transition: SPRING_HOVER }}
            whileTap={{ scale: 0.98, transition: SPRING_TAP }}
            className="group relative rounded-3xl overflow-hidden cursor-pointer border border-white/10 hover:border-primary/40 bg-card/85 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full"
        >
            {/* Top Image Section */}
            <div className="relative h-56 w-full overflow-hidden bg-black/50" onClick={onViewDetails}>
                <img
                    src={tour.image || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80"}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/SevUsal.png';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-black/40 to-black/20" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-full backdrop-blur-md border flex items-center gap-1.5 shadow-sm ${categoryMeta.badgeStyle}`}>
                        <CategoryIcon className="w-3 h-3" />
                        {categoryMeta.label}
                    </span>

                    <span className="px-2.5 py-1 text-xs font-bold text-amber-300 bg-black/80 backdrop-blur-md border border-amber-500/30 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {tour.rating ? Number(tour.rating).toFixed(1) : "4.8"}
                    </span>
                </div>

                {/* Bottom Overlay: City & Difficulty */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 text-xs text-white/90">
                    <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 font-medium">
                        <MapPin className="w-3 h-3 text-primary" /> {tour.city || 'Vadodara'}
                    </span>
                    {tour.difficulty && (
                        <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 font-medium text-white/80">
                            {tour.difficulty}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div onClick={onViewDetails} className="space-y-2">
                    <h3 className="text-xl font-display font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
                        {tour.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {tour.description}
                    </p>
                </div>

                {/* Key Metrics Chips */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                        <Clock className="w-3.5 h-3.5 text-primary mb-0.5" />
                        <span className="font-bold text-foreground truncate w-full">{tour.duration || '3 Hours'}</span>
                        <span className="text-[10px] text-muted-foreground">Duration</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                        <MapPin className="w-3.5 h-3.5 text-orange-400 mb-0.5" />
                        <span className="font-bold text-foreground truncate w-full">{tour.stops?.length || 4} Stops</span>
                        <span className="text-[10px] text-muted-foreground">Tastings</span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                        <Users className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                        <span className="font-bold text-foreground truncate w-full">Max 20</span>
                        <span className="text-[10px] text-muted-foreground">Group Size</span>
                    </div>
                </div>

                {/* Next Available Slot Indicator */}
                {nextSlot ? (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                        <div className="flex items-center gap-1.5 text-primary font-medium truncate">
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                                {new Date(nextSlot.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at {nextSlot.startTime}
                            </span>
                        </div>
                        {remainingSeats !== null && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary shrink-0">
                                {remainingSeats} seats left
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Daily departures upon booking</span>
                    </div>
                )}

                {/* Pricing & CTA Actions Bar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Per Person</span>
                        <div className="flex items-baseline gap-0.5 font-bold text-lg text-foreground">
                            <IndianRupee className="w-4 h-4 text-primary" />
                            <span>{tour.price}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onViewDetails}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-foreground text-xs font-semibold border border-white/10 transition-colors"
                        >
                            View Tour
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onBookNow) onBookNow();
                                else onViewDetails();
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-xl text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
                        >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default TourCard;
