import { useTextScrollReveal } from "@/hooks/useTextScrollReveal";

export const PricingSectionHeader = () => {
    const ref = useTextScrollReveal<HTMLDivElement>({ threshold: 0.2, staggerMs: 30 });
    return (
        <div ref={ref} className="content-center box-border caret-transparent gap-x-4 flex auto-cols-[1fr] grid-cols-[1fr] grid-rows-[auto] justify-center min-h-[auto] min-w-[auto] gap-y-4">
            <h2
                aria-label="Choose Your AI Model, Start Building Today"
                className="text-zinc-900 text-4xl font-medium items-center box-border caret-transparent justify-center leading-[43.2px] max-w-[439px] min-h-[auto] min-w-[auto] md:text-5xl md:leading-[57.6px]"
            >
                {[
                    ["C", "h", "o", "o", "s", "e"],
                    ["Y", "o", "u", "r"],
                    ["A", "I"],
                    ["M", "o", "d", "e", "l", ","],
                ].map((word, wi) => (
                    <span key={wi} className="relative text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">
                        {word.map((ch, ci) => (
                            <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">{ch}</span>
                        ))}
                        {"\u00A0"}
                    </span>
                ))}
                <span className="text-4xl italic box-border caret-transparent tracking-[-1px] leading-[43.2px] font-instrument_serif md:text-5xl md:leading-[57.6px]">
                    <em className="text-4xl box-border caret-transparent leading-[43.2px] md:text-5xl md:leading-[57.6px]">
                        {[
                            ["S", "t", "a", "r", "t"],
                            ["B", "u", "i", "l", "d", "i", "n", "g"],
                            ["T", "o", "d", "a", "y"],
                        ].map((word, wi) => (
                            <span key={wi} className="relative text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">
                                {word.map((ch, ci) => (
                                    <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">{ch}</span>
                                ))}
                                {"\u00A0"}
                            </span>
                        ))}
                    </em>
                </span>
            </h2>
        </div>
    );
};
