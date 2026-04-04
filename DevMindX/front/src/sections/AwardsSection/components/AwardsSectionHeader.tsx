import { useTextScrollReveal } from "@/hooks/useTextScrollReveal";

export const AwardsSectionHeader = () => {
    const ref = useTextScrollReveal<HTMLDivElement>({ threshold: 0.2, staggerMs: 28 });
    return (
        <div ref={ref} className="content-center box-border caret-transparent gap-x-4 grid auto-cols-[1fr] grid-cols-[0.75fr] grid-rows-[auto] justify-center gap-y-4">
            <h2
                aria-label="Accolades and achievements celebrating our technical excellence"
                className="text-zinc-900 text-4xl font-medium items-center box-border caret-transparent flex-col justify-center leading-[43.2px] max-w-[704px] min-h-[auto] min-w-[auto] text-center mx-auto md:text-5xl md:leading-[57.6px]"
            >
                {[
                    ["A", "c", "c", "o", "l", "a", "d", "e", "s"],
                    ["a", "n", "d"],
                    ["a", "c", "h", "i", "e", "v", "e", "m", "e", "n", "t", "s"],
                    ["c", "e", "l", "e", "b", "r", "a", "t", "i", "n", "g"],
                    ["o", "u", "r"],
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
                            ["t", "e", "c", "h", "n", "i", "c", "a", "l"],
                            ["e", "x", "c", "e", "l", "l", "e", "n", "c", "e"],
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
