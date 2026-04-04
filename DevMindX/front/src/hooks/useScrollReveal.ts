import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
                        entry.target.classList.add("revealed");
                    } else if (!entry.isIntersecting || entry.intersectionRatio === 0) {
                        entry.target.classList.remove("revealed");
                    }
                });
            },
            { threshold: [0, 0.12] }
        );

        const children = el.querySelectorAll(".reveal, .reveal-right, .reveal-left, .reveal-scale");
        children.forEach((child) => observer.observe(child));
        if (el.matches(".reveal, .reveal-right, .reveal-left, .reveal-scale")) observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return ref;
}
