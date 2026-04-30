import { Variants, Transition, useReducedMotion } from "framer-motion";

// --- Spring Configurations (Exact Values) ---

export const SPRING_HOVER: Transition = {
    type: "spring",
    stiffness: 420,
    damping: 32,
    mass: 0.8,
};

export const SPRING_TAP: Transition = {
    type: "spring",
    stiffness: 600,
    damping: 40,
    mass: 0.6,
};

export const SPRING_ENTRY: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 30,
    mass: 1,
};

export const SPRING_TILT: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 28,
    mass: 1,
};

export const SPRING_LOW_END: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 34,
    mass: 1.1,
};

export const SPRING_SUBTLE: Transition = {
    type: "spring",
    stiffness: 180,
    damping: 26,
    mass: 1.2,
};

// --- Reusable Variants ---

// Fade In
export const fadeIn: Variants = {
    hidden: { opacity: 0, y: 8 }, // Small distance (2-8px)
    visible: {
        opacity: 1,
        y: 0,
        transition: SPRING_ENTRY
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

// Simple Scale for Press
export const pressScale: Variants = {
    rest: { scale: 1 },
    tap: {
        scale: 0.96,
        transition: SPRING_TAP
    }
};

// Hover Lift (No Tilt)
export const hoverLift: Variants = {
    rest: { y: 0 },
    hover: {
        y: -4, // Small distance
        transition: SPRING_HOVER
    }
};

/**
 * Returns the appropriate transition based on user preference.
 * If reduced motion is preferred, returns a simpler, slower spring or standard ease.
 */
export const useSmartMotion = () => {
    const shouldReduceMotion = useReducedMotion();

    return {
        hover: shouldReduceMotion ? { duration: 0.1 } : SPRING_HOVER,
        tap: shouldReduceMotion ? { duration: 0.1 } : SPRING_TAP,
        entry: shouldReduceMotion ? { opacity: { duration: 0.3 } } : SPRING_ENTRY,
        tilt: shouldReduceMotion ? null : SPRING_TILT,
        isReduced: shouldReduceMotion,
    };
};

/**
 * Standard Interaction Prop helpers
 */
export const ACTION_PROPS = {
    whileHover: "hover",
    whileTap: "tap",
    variants: {
        hover: hoverLift.hover,
        tap: pressScale.tap,
    }
};
