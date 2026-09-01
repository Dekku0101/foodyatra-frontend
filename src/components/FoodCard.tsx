import { memo, useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { 
  Star, Heart, MapPin, Sparkles, IndianRupee, Flame, 
  Leaf, TrendingUp, Zap, ArrowRight 
} from 'lucide-react';
import { SPRING_HOVER, SPRING_TAP, SPRING_TILT } from '../motion/motionPresets';

export interface FoodCardProps {
    name: string;
    restaurant: string;
    area: string;
    isVeg: boolean;
    priceRange: string;
    rating: number;
    badge?: 'famous' | 'hidden';
    image: string;
    onHover?: () => void;
    onLeave?: () => void;
    onClick?: () => void;
    mapUrl?: string;
    delay?: number;
    imageFit?: "cover" | "contain" | "fill";
    imagePosition?: "center" | "top" | "bottom";
    variant?: "default" | "quiet";
    topLabel?: string;
    cuisine?: string;
    tags?: string[];
}

/**
 * Dynamic contextual badge classifier to eliminate repetitive badges
 */
const getDynamicBadge = (
    name: string,
    restaurant: string,
    area: string,
    rating: number,
    priceRange: string,
    isVeg: boolean,
    badge?: string,
    topLabel?: string
) => {
    if (topLabel) {
        return { label: topLabel, style: 'bg-primary/20 text-primary border-primary/30', icon: Sparkles };
    }

    const text = `${name} ${restaurant} ${area}`.toLowerCase();

    // 1. Heritage spots
    if (
        text.includes('mahakali') || text.includes('sev usal') || 
        text.includes('duliram') || text.includes('pedas') || 
        text.includes('jagdish') || text.includes('chevdo') || 
        text.includes('pyarelal') || text.includes('mandap') || 
        text.includes('heritage') || text.includes('sasuma') ||
        text.includes('canara') || text.includes('das khaman')
    ) {
        return { label: 'Vadodara Heritage', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Star };
    }

    // 2. Hidden Gems
    if (badge === 'hidden' || text.includes('secret') || text.includes('lane') || text.includes('woodbond') || text.includes('arabian knife')) {
        return { label: 'Hidden Gem', style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: Sparkles };
    }

    // 3. Spicy Favorites
    if (text.includes('usal') || text.includes('misal') || text.includes('spicy') || text.includes('tikha') || text.includes('chilli') || text.includes('shawarma') || text.includes('tandoori') || text.includes('tawa')) {
        return { label: 'Spicy Favourite', style: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: Flame };
    }

    // 4. Family Favorites
    if (text.includes('thali') || text.includes('family') || text.includes('dining') || text.includes('kathiyawadi') || text.includes('little italy') || text.includes('swagat')) {
        return { label: 'Family Favourite', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Leaf };
    }

    // 5. Highly Rated
    if (rating >= 4.7) {
        return { label: 'Highly Rated', style: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', icon: Star };
    }

    // 6. Trending
    if (rating >= 4.5) {
        return { label: 'Trending', style: 'bg-orange-500/20 text-orange-300 border-orange-500/40', icon: TrendingUp };
    }

    // 7. Budget Pick
    const price = parseInt(String(priceRange).replace(/[^0-9-]/g, '').split('-')[0]) || 0;
    if (price > 0 && price < 150) {
        return { label: 'Budget Pick', style: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Zap };
    }

    return { label: 'AI Recommended', style: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: Sparkles };
};

const getPriceInfo = (priceRange: string) => {
    const raw = String(priceRange || '150').replace(/[^0-9-]/g, '');
    const price = parseInt(raw.split('-')[0]) || 150;
    return {
        amount: price,
        label: price < 150 ? 'Budget' : price < 400 ? 'Mid-Range' : 'Fine Dine'
    };
};

const FoodCard = memo(({ 
    name, 
    restaurant, 
    area, 
    isVeg, 
    priceRange, 
    rating, 
    badge, 
    image, 
    onHover, 
    onLeave, 
    onClick, 
    imagePosition = "center", 
    variant = "default", 
    topLabel 
}: FoodCardProps) => {
    const [isLiked, setIsLiked] = useState(false);
    const [imageError, setImageError] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Motion Values for gentle tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const spotlightX = useMotionValue(0);
    const spotlightY = useMotionValue(0);

    const prefersReducedMotion = useReducedMotion();
    const [isMobile, setIsMobile] = useState(false);
    const isQuiet = variant === "quiet";

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const reduceMotion = prefersReducedMotion || isMobile || isQuiet;
    const mouseX = useSpring(x, SPRING_TILT);
    const mouseY = useSpring(y, SPRING_TILT);

    const tiltRange = reduceMotion ? ["0deg", "0deg"] : ["4deg", "-4deg"];
    const rotateX = useTransform(mouseY, [-0.5, 0.5], tiltRange as any);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], tiltRange.slice().reverse() as any);

    const spotlightGradient = useTransform(
        [spotlightX, spotlightY],
        ([sx, sy]) => `radial-gradient(350px circle at ${sx}px ${sy}px, rgba(249, 115, 22, 0.08), transparent 70%)`
    );

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (reduceMotion) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        spotlightX.set(clientX);
        spotlightY.set(clientY);

        x.set((clientX / rect.width) - 0.5);
        y.set((clientY / rect.height) - 0.5);

        if (onHover) onHover();
    }, [x, y, spotlightX, spotlightY, reduceMotion, onHover]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
        if (onLeave) onLeave();
    }, [x, y, onLeave]);

    const dynamicBadge = getDynamicBadge(name, restaurant, area, rating, priceRange, isVeg, badge, topLabel);
    const BadgeIcon = dynamicBadge.icon;
    const priceInfo = getPriceInfo(priceRange);

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px" }}
            whileHover={reduceMotion ? {} : { y: -5, transition: SPRING_HOVER }}
            whileTap={{ scale: 0.98, transition: SPRING_TAP }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onClick) onClick();
                }
            }}
            style={{
                rotateX: prefersReducedMotion ? 0 : rotateX,
                rotateY: prefersReducedMotion ? 0 : rotateY,
                transformStyle: "preserve-3d",
                perspective: 1000
            } as any}
            className={`group relative glass-card flex flex-col overflow-hidden cursor-pointer rounded-3xl border border-white/10 hover:border-primary/40 bg-card/80 shadow-md hover:shadow-2xl transition-all duration-300 ${
                isQuiet ? 'h-[22rem]' : 'h-[24rem]'
            }`}
        >
            {/* Ambient Cursor Glow on Hover */}
            {!isQuiet && (
                <motion.div
                    className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: spotlightGradient }}
                />
            )}

            {/* Top Image Section (Standardized 16:10 Proportion) */}
            <div className="relative w-full h-48 sm:h-52 shrink-0 overflow-hidden bg-black/40">
                <img
                    src={imageError ? '/images/SevUsal.png' : image}
                    alt={name}
                    onError={() => setImageError(true)}
                    className={`w-full h-full object-cover ${
                        imagePosition === 'top' ? 'object-top' : imagePosition === 'bottom' ? 'object-bottom' : 'object-center'
                    } group-hover:scale-105 transition-transform duration-500 ease-out`}
                    loading="lazy"
                />

                {/* Subtle Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-black/30 to-black/20" />

                {/* Dynamic Contextual Badge (Top Left) */}
                <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-sm ${dynamicBadge.style}`}>
                        <BadgeIcon className="w-3 h-3 shrink-0" />
                        <span>{dynamicBadge.label}</span>
                    </div>
                </div>

                {/* Bookmark Heart Button (Top Right) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsLiked(!isLiked);
                    }}
                    tabIndex={-1}
                    className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 backdrop-blur-md transition-all group/btn"
                    title={isLiked ? "Remove from Favorites" : "Save to Favorites"}
                    aria-label="Save to Favorites"
                >
                    <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-white/80 group-hover/btn:text-rose-400'}`} />
                </button>

                {/* Dietary Status Pill + Rating Badge (Bottom of Image) */}
                <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
                    {/* FSSAI Standard Dietary Indicator */}
                    <div 
                        className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/15 shadow-sm"
                        title={isVeg ? "100% Pure Vegetarian" : "Non-Vegetarian"}
                    >
                        <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${isVeg ? 'border-emerald-500 bg-emerald-950/90' : 'border-rose-500 bg-rose-950/90'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        </div>
                        <span className={`text-[10px] font-bold tracking-wider uppercase ${isVeg ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                    </div>

                    {/* Rating Pill */}
                    <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 shadow-sm">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-white">{Number(rating || 4.5).toFixed(1)}</span>
                    </div>
                </div>
            </div>

            {/* Content Details Section (Typography & Spacing Polish) */}
            <div className="p-4 flex-1 flex flex-col justify-between relative z-20">
                <div>
                    {/* Food Name: Strongest visual text element */}
                    <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug tracking-tight" title={name}>
                        {name}
                    </h3>

                    {/* Restaurant & Area: Clean secondary hierarchy */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground/80 truncate">{restaurant}</span>
                        {area && (
                            <>
                                <span className="text-white/20">•</span>
                                <span className="truncate text-muted-foreground">{area}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Bar: Price Tier + View Details Affordance */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-[11px] text-muted-foreground">Avg:</span>
                        <div className="flex items-center font-bold text-sm text-foreground">
                            <IndianRupee className="w-3.5 h-3.5 text-primary" />
                            <span>{priceInfo.amount}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/70 font-medium ml-1">
                            ({priceInfo.label})
                        </span>
                    </div>

                    {/* Subtle View Details affordance */}
                    <div className="flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default FoodCard;
