import { memo, useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { Star, Heart, MapPin, Sparkles, IndianRupee, Flame, Leaf, IceCream, TrendingUp, Zap, HelpCircle } from 'lucide-react';
import {
    SPRING_HOVER,
    SPRING_TAP,
    SPRING_TILT
} from '../motion/motionPresets';

export interface FoodCardProps {
    name: string;
    restaurant: string;
    area: string;
    isVeg: boolean;
    priceRange: string;
    rating: number;
    badge: 'famous' | 'hidden';
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
}

const getTasteProfile = (name: string, type: string, isVeg: boolean) => {
    const text = (name + " " + type).toLowerCase();

    if (text.includes('spicy') || text.includes('usal') || text.includes('misal') || text.includes('chilli') || text.includes('mirch') || text.includes('shawarma') || text.includes('kathiyawadi') || text.includes('tawa')) return 'glow-spicy';

    if (text.includes('ice cream') || text.includes('kulfi') || text.includes('sweet') || text.includes('shake') || text.includes('dessert') || text.includes('chocolate') || text.includes('falooda')) return 'glow-sweet';

    if (text.includes('pizza') || text.includes('burger') || text.includes('cafe') || text.includes('pasta') || text.includes('italian') || text.includes('coffee')) return 'glow-premium';

    if (!isVeg && (text.includes('chicken') || text.includes('mutton') || text.includes('fish'))) return 'glow-spicy';

    return 'glow-savory';
};

const getPriceConfidence = (priceRange: string) => {
    const price = parseInt(priceRange.split('-')[0]) || 0;
    if (price < 150) return { label: 'Budget', color: 'text-emerald-400' };
    if (price < 350) return { label: 'Balanced', color: 'text-blue-400' };
    return { label: 'Premium', color: 'text-amber-400' };
};

const getTasteDNA = (name: string, type: string, isVeg: boolean) => {
    const text = (name + " " + type).toLowerCase();
    const traits = [];

    if (text.includes('spicy') || text.includes('chilli') || text.includes('mirch')) {
        traits.push({ icon: Flame, color: 'text-orange-500', label: 'Spicy' });
    }
    if (text.includes('sweet') || text.includes('dessert') || text.includes('chocolate')) {
        traits.push({ icon: IceCream, color: 'text-pink-400', label: 'Sweet' });
    }
    if (isVeg || text.includes('salad') || text.includes('healthy')) {
        traits.push({ icon: Leaf, color: 'text-emerald-400', label: 'Light' });
    } else {
        traits.push({ icon: TrendingUp, color: 'text-rose-400', label: 'Rich' });
    }

    // Fallback
    if (traits.length === 0) traits.push({ icon: Zap, color: 'text-yellow-400', label: 'Popular' });

    return traits.slice(0, 3); // Max 3 traits
};



const FoodCard = memo(({ name, restaurant, area, isVeg, priceRange, rating, badge, image, onHover, onLeave, onClick, imageFit = "cover", imagePosition = "center", delay, variant = "default", topLabel }: FoodCardProps) => {
    const [isLiked, setIsLiked] = useState(false);

    // Ref for easy coordinate calculation
    const cardRef = useRef<HTMLDivElement>(null);

    // Motion Values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const spotlightX = useMotionValue(0);
    const spotlightY = useMotionValue(0);

    const prefersReducedMotion = useReducedMotion();
    const [isMobile, setIsMobile] = useState(false);

    // Quiet Mode forced overrides
    const isQuiet = variant === "quiet";

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const reduceMotion = prefersReducedMotion || isMobile || isQuiet;

    // Smooth springs for tilt - Optimized for 165Hz
    const mouseX = useSpring(x, SPRING_TILT);
    const mouseY = useSpring(y, SPRING_TILT);

    // Tilt Transforms - Deep & Realistic (Canvas Effect)
    // Reduce completely if motion disabled/mobile/quiet
    const tiltRange = reduceMotion ? ["0deg", "0deg"] : ["6deg", "-6deg"];
    const rotateX = useTransform(mouseY, [-0.5, 0.5], tiltRange as any);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], tiltRange.slice().reverse() as any);

    // Dynamic Spotlight Gradient - Soft "Ambience" Glow
    const spotlightGradient = useTransform(
        [spotlightX, spotlightY],
        ([sx, sy]) => `radial-gradient(400px circle at ${sx}px ${sy}px, rgba(255,255,255,0.08), transparent 60%)`
    );

    // Floating Animation (paused if reduced motion)
    const floatDuration = 6;
    const floatDelay = delay || Math.random() * 2;
    const floatY = reduceMotion ? 0 : [0, -6, 0];

    // Interaction handlers
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (reduceMotion) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        // Spotlight follows cursor directly - Instant feedback
        spotlightX.set(clientX);
        spotlightY.set(clientY);

        // Tilt calc (normalized -0.5 to 0.5)
        const xPct = (clientX / width) - 0.5;
        const yPct = (clientY / height) - 0.5;

        x.set(xPct);
        y.set(yPct);

        if (onHover) onHover();
    }, [x, y, spotlightX, spotlightY, reduceMotion, onHover]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
        if (onLeave) onLeave();
    }, [x, y, onLeave]);

    const priceConfidence = getPriceConfidence(priceRange);
    const tasteDNA = getTasteDNA(name, restaurant, isVeg);
    const confidenceScore = Math.min(99, Math.floor(rating * 19 + (Math.random() * 5))); // Pseudo-score

    return (
        <motion.div
            ref={cardRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "0px" }}
            whileHover={reduceMotion ? {} : "hover"}
            whileTap="tap"
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: floatY, // Gentle Floating
                    transition: {
                        y: {
                            duration: floatDuration,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
                            delay: floatDelay
                        },
                        opacity: { duration: 0.5 }
                    }
                },
                hover: {
                    scale: 1.02,
                    y: -4,
                    transition: SPRING_HOVER
                },
                tap: {
                    scale: 0.98,
                    transition: SPRING_TAP
                }
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            // Accessibility attributes
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onClick) onClick();
                }
            }}
            style={{
                "--x": spotlightX,
                "--y": spotlightY,
                rotateX: prefersReducedMotion ? 0 : rotateX,
                rotateY: prefersReducedMotion ? 0 : rotateY,
                transformStyle: "preserve-3d", // Critical for 3D depth
                perspective: 1000
            } as any}
            className={`group relative glass-card flex flex-col overflow-hidden cursor-pointer ${isQuiet ? 'shadow-none border-white/5 bg-black/40 hover:bg-black/50' : `shadow-premium hover:shadow-2xl ${getTasteProfile(name, restaurant, isVeg)}`} transition-all duration-500 h-[24rem] will-change-transform rounded-3xl ${isQuiet ? '' : 'group-hover/list:blur-[2px] hover:!blur-0 hover:z-50'}`}
        >
            {/* Dynamic Spotlight Effect - Hidden in Quiet Mode */}
            {!isQuiet && (
                <motion.div
                    className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: spotlightGradient }}
                />
            )}

            {/* Glossy Reflection (Static / Tilt based) */}
            <motion.div
                style={{
                    opacity: useTransform(mouseY, [-0.5, 0.5], [0, 0.3]),
                    background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)"
                }}
                className="absolute inset-0 z-20 pointer-events-none rounded-3xl"
            />

            {/* Image Section - Hero (Flex-1 to fill remaining space) */}
            {/* Pop-out effect: translateZ(30px) */}
            <div
                className="relative w-full flex-1 min-h-0 overflow-hidden"
                style={{ transform: "translateZ(30px)", borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}
            >
                <motion.img
                    src={image}
                    alt={name}
                    className={`w-full h-full object-cover ${imagePosition === 'top' ? 'object-top' : imagePosition === 'bottom' ? 'object-bottom' : 'object-center'} will-change-transform group-hover:scale-105 transition-transform duration-1000 ease-out`}
                    loading="lazy"
                />

                {/* Cinematic Bottom Fade - Darker for calmness */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />

                {/* Top Badges - Hidden in Quiet Mode */}
                {!isQuiet && (
                    <div className="absolute top-6 left-6 flex items-center gap-2 z-30">
                        {badge === 'famous' ? (
                            <div className="flex items-center gap-1.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-white">Famous</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 opacity-90">
                                <Sparkles className="w-3.5 h-3.5 text-white/90" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-white/90">Hidden</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Favorite Button (Top Right) */}
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                    // Remove from tab order as the card is clickable
                    tabIndex={-1}
                    className="absolute top-4 right-4 p-2 rounded-full glass-pill bg-black/40 hover:bg-black/60 border-white/10 backdrop-blur-md transition-colors z-30"
                >
                    <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-white/90'}`} />
                </motion.button>

                {/* LIVE Status Check (Bottom Left) - Hidden in Quiet Mode */}
                {!isQuiet && (
                    <div className="absolute bottom-4 left-4 z-30 flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-[ping_3s_linear_infinite] absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 box-shadow-glow"></span>
                            </span>
                            <span>Live</span>
                        </div>

                        {/* AI Confidence Indicator */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin duration-[3s]" />
                            <span>{confidenceScore}% Match</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section - Below Image */}
            {/* Pop-out effect: translateZ(20px) */}
            <div
                className="shrink-0 p-4 pt-3 flex flex-col relative bg-transparent"
                style={{ transform: isQuiet ? "none" : "translateZ(20px)" }}
            >

                <div>
                    {/* Micro-text: Why this card */}
                    {!isQuiet && (
                        <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1 opacity-80">
                            {topLabel ? topLabel : (badge === 'hidden' ? "Secret Spot" :
                                rating >= 4.7 ? "Locals' Favorite" :
                                    parseInt(priceRange.split('-')[0]) < 200 ? "Budget Friendly" :
                                        "Trending Now")}
                        </p>
                    )}

                    <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className={`font-display font-bold ${isQuiet ? 'text-2xl mt-2 text-center' : 'text-xl'} leading-tight text-primary truncate drop-shadow-sm`}>
                                {name}
                            </h3>
                            <p className={`${isQuiet ? 'text-center text-base' : 'text-sm'} text-white/60 truncate font-medium mt-2 tracking-wide`}>{restaurant}</p>
                        </div>

                        {/* Why not others tooltip - Hidden in Quiet Mode */}
                        {!isQuiet && (
                            <div className="group/tooltip relative">
                                <HelpCircle className="w-4 h-4 text-white/20 hover:text-white/60 transition-colors cursor-help" />
                                <div className="absolute right-0 top-6 w-48 p-2 bg-black/90 text-[10px] text-white/80 rounded-lg border border-white/10 backdrop-blur-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 shadow-xl pointer-events-none">
                                    Selected based on high rating and {priceConfidence.label} pricing relative to other options in {area}.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Taste DNA Indicators - Hidden in Quiet Mode */}
                    {!isQuiet && (
                        <div className="flex items-center gap-4 text-xs text-white/50 mt-3">
                            <div className="flex items-center gap-2">
                                {tasteDNA.map((trait, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5 border border-white/5">
                                        <trait.icon className={`w-3 h-3 ${trait.color}`} />
                                        <span className="text-[10px] uppercase font-bold tracking-wider">{trait.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto shrink-0 z-20">
                    {/* Price Confidence */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-sm font-bold text-white">
                            <IndianRupee className="w-3.5 h-3.5 text-white/80" /> {priceRange.split('-')[0]}
                            <span className="text-[10px] font-normal text-white/70 ml-1 uppercase">{priceConfidence.label}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-white/10 text-white/60" />
                        <span className="text-sm font-bold text-white/90">{rating}</span>
                    </div>
                </div>

            </div>
        </motion.div>
    );
});

export default FoodCard;
