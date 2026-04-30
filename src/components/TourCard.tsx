import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowRight, Star, IndianRupee, Users } from 'lucide-react';
import { SPRING_HOVER, SPRING_TAP, SPRING_ENTRY, ACTION_PROPS } from '../motion/motionPresets';

export interface TourStop {
    name: string;
    highlightDish: string;
    description?: string;
    lat: number;
    lng: number;
}

export interface Tour {
    _id: string;
    title: string;
    city: string;
    image: string;
    price: number;
    duration: string;
    stops: TourStop[];
    description: string;
    rating?: number;
    meetingPoint?: string;
}

interface TourCardProps {
    tour: Tour;
    onClick: () => void;
}

const TourCard = memo(({ tour, onClick }: TourCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={SPRING_ENTRY}
            viewport={{ once: true }}
            whileHover="hover"
            whileTap="tap"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
            variants={{
                hover: { y: -5, transition: SPRING_HOVER },
                tap: { scale: 0.98, transition: SPRING_TAP }
            }}
            className="group relative h-[28rem] rounded-2xl overflow-hidden cursor-pointer shadow-premium hover:shadow-2xl transition-shadow duration-500 border border-white/10 bg-card will-change-transform"
        >
            {/* Image Background */}
            <div className="absolute inset-0">
                <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[80%] bg-gradient-to-t from-black via-black/40 to-transparent opacity-60" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-6 z-10">

                {/* City Badge */}
                <div className="absolute top-4 left-4">
                    <span className="glass-pill px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-sm">
                        <MapPin className="w-3 h-3 text-primary" /> {tour.city}
                    </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4">
                    <span className="glass-pill px-3 py-1 text-xs font-bold text-amber-400 bg-black/40 backdrop-blur-md border border-amber-500/20 flex items-center gap-1.5 shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400" /> {tour.rating || "4.8"}
                    </span>
                </div>

                {/* Title & Desc */}
                <div className="mb-4">
                    <h3 className="text-2xl font-display font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                        {tour.title}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-2">
                        {tour.description}
                    </p>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-4 text-sm text-gray-300 font-medium mb-4">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        {tour.duration}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-primary" />
                        {tour.stops?.length || 0} Stops
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-primary" />
                        Max 8
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Per Person</span>
                        <div className="flex items-center gap-0.5 text-lg font-bold text-white">
                            <IndianRupee className="w-4 h-4" /> {tour.price}
                        </div>
                    </div>

                    <motion.button
                        {...ACTION_PROPS}
                        variants={{
                            hover: { scale: 1.05, transition: SPRING_HOVER },
                            tap: { scale: 0.95, transition: SPRING_TAP }
                        }}
                        tabIndex={-1}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-lg text-sm shadow-glow-primary hover:bg-primary/90 transition-colors"
                    >
                        View Details <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>

            </div>
        </motion.div>
    );
});

export default TourCard;
