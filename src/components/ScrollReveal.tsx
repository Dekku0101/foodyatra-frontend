import { motion, Variants } from 'framer-motion';
import React from 'react';
import { SPRING_ENTRY } from '../motion/motionPresets';

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number;
    distance?: number;
}

const getVariants = (direction: string, distance: number): Variants => {
    const directions: Record<string, { x?: number; y?: number }> = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance },
        none: {},
    };

    return {
        hidden: { opacity: 0, ...directions[direction] },
        visible: { opacity: 1, x: 0, y: 0 },
    };
};

const ScrollReveal = ({ children, className = '', delay = 0, direction = 'up', duration = 0.6, distance = 40 }: ScrollRevealProps) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={getVariants(direction, distance)}
            transition={{ ...SPRING_ENTRY, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default ScrollReveal;
