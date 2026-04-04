import { useEffect, useRef } from "react";

/**
 * Attaches a scroll-scrub reveal to every `.letter` child found inside
 * the returned ref element. Letters transition proportional to how far
 * the user has scrolled past the container.
 */
export function useTextScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options?: any // Ignored backwards compatibility parameter
) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const letters = Array.from(container.querySelectorAll<HTMLElement>(".letter"));
        if (!letters.length) return;

        // Apply a very slight transition to smooth out fast scrolling
        letters.forEach((el) => {
            el.style.transition = "color 0.1s ease-out";
            el.style.color = "rgba(0, 0, 0, 0.2)"; // Force initial grey
        });

        const handleScroll = () => {
            const rect = container.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Start revealing when the top of the element passes 85% down the screen
            const startRevealY = windowHeight * 0.85;
            // Finish revealing when the top of the element hits exactly 40% down the screen
            const endRevealY = windowHeight * 0.40;
            
            const currentY = rect.top;
            
            let progress = 0;
            if (currentY <= endRevealY) {
                progress = 1;
            } else if (currentY >= startRevealY) {
                progress = 0;
            } else {
                progress = (startRevealY - currentY) / (startRevealY - endRevealY);
            }

            const lettersToHighlight = Math.ceil(progress * letters.length);

            letters.forEach((el, index) => {
                if (index < lettersToHighlight) {
                    el.style.color = "rgb(9, 9, 11)"; // full dark text
                } else {
                    el.style.color = "rgba(0, 0, 0, 0.2)"; // muted grey
                }
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Trigger immediate evaluation on mount

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return ref;
}
