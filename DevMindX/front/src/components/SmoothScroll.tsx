import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
    children: React.ReactNode;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis for buttery smooth momentum scrolling
        const lenis = new Lenis({
            duration: 1.2, // Scroll duration
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-like easing curve
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        lenisRef.current = lenis;

        // Hook up the internal ticker to the browser's refresh rate
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Clean up on component unmount to prevent memory leaks
        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
};
