import { useTextScrollReveal } from "@/hooks/useTextScrollReveal";

export const TestimonialsSectionHeader = () => {
    const ref = useTextScrollReveal<HTMLDivElement>({ threshold: 0.2, staggerMs: 28 });
    return (
        <div ref={ref} className="box-border caret-transparent gap-x-4 flex auto-cols-[1fr] grid-cols-[1fr] grid-rows-[auto] justify-center gap-y-4">
            <h2
                aria-label="What developers are saying about DevMindX"
                className="text-zinc-900 text-4xl font-medium box-border caret-transparent leading-[48px] max-w-[600px] min-h-[auto] min-w-[auto] text-center md:text-5xl md:max-w-[650px]"
            >
                {[
                    ["W", "h", "a", "t"],
                    ["d", "e", "v", "e", "l", "o", "p", "e", "r", "s"],
                    ["a", "r", "e"],
                    ["s", "a", "y", "i", "n", "g"],
                ].map((word, wi) => (
                    <span key={wi} className="relative text-4xl box-border caret-transparent inline-block md:text-5xl">
                        {word.map((ch, ci) => (
                            <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block md:text-5xl">{ch}</span>
                        ))}
                        {"\u00A0"}
                    </span>
                ))}
                <em className="text-4xl italic box-border caret-transparent md:text-5xl">
                    {[["a", "b", "o", "u", "t"]].map((word, wi) => (
                        <span key={wi} className="relative text-4xl box-border caret-transparent inline-block md:text-5xl">
                            {word.map((ch, ci) => (
                                <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block md:text-5xl">{ch}</span>
                            ))}
                            {"\u00A0"}
                        </span>
                    ))}
                </em>
                <span className="text-4xl italic font-normal box-border caret-transparent tracking-[-1px] font-instrument_serif md:text-5xl">
                    <em className="text-4xl box-border caret-transparent md:text-5xl">
                        {[["D", "e", "v", "M", "i", "n", "d", "X"]].map((word, wi) => (
                            <span key={wi} className="relative text-4xl box-border caret-transparent inline-block md:text-5xl">
                                {word.map((ch, ci) => (
                                    <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block md:text-5xl">{ch}</span>
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
