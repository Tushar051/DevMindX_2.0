import { useTextScrollReveal } from "@/hooks/useTextScrollReveal";

export const FeaturesSectionHeader = () => {
    const ref = useTextScrollReveal<HTMLDivElement>({ threshold: 0.2, staggerMs: 30 });
    return (
        <div ref={ref} className="content-center items-center box-border caret-transparent gap-x-4 flex auto-cols-[1fr] grid-cols-[1fr_1fr_1fr] grid-rows-[auto] justify-center justify-items-center max-w-[1272px] gap-y-4">
            <h2
                aria-label="Where Your Ideas Meet Production-Ready Code"
                className="text-4xl font-medium box-border caret-transparent leading-[43.2px] mt-[-114px] max-w-[425px] min-h-[auto] min-w-[auto] text-center md:text-5xl md:leading-[57.6px]"
            >
                {[
                    { word: ["W", "h", "e", "r", "e"], italic: false },
                    { word: ["Y", "o", "u", "r"], italic: false },
                    { word: ["I", "d", "e", "a", "s"], italic: false },
                    { word: ["M", "e", "e", "t"], italic: false },
                ].map(({ word }, wi) => (
                    <span key={wi} className="relative text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">
                        {word.map((ch, ci) => (
                            <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">{ch}</span>
                        ))}
                        {"\u00A0"}
                    </span>
                ))}
                <span className="text-4xl italic box-border caret-transparent tracking-[-1px] leading-[43.2px] font-instrument_serif md:text-5xl md:leading-[57.6px]">
                    {[
                        ["P", "r", "o", "d", "u", "c", "t", "i", "o", "n", "-", "R", "e", "a", "d", "y"],
                        ["C", "o", "d", "e"],
                    ].map((word, wi) => (
                        <span key={wi} className="relative text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">
                            {word.map((ch, ci) => (
                                <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">{ch}</span>
                            ))}
                            {"\u00A0"}
                        </span>
                    ))}
                </span>
            </h2>
        </div>
    );
};
