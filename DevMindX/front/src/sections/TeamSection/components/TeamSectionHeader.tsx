import { useTextScrollReveal } from "@/hooks/useTextScrollReveal";

export const TeamSectionHeader = () => {
    const ref = useTextScrollReveal<HTMLDivElement>({ threshold: 0.2, staggerMs: 30 });
    return (
        <div ref={ref} className="box-border caret-transparent gap-x-4 grid auto-cols-[1fr] grid-cols-[1fr] grid-rows-[auto] gap-y-4">
            <h2
                aria-label="Meet the creative minds behind our success"
                className="text-zinc-900 text-4xl font-medium box-border caret-transparent leading-[48px] max-w-[400px] min-h-[auto] min-w-[auto] text-center mx-auto md:text-5xl md:max-w-[600px]"
            >
                {[
                    { word: ["M", "e", "e", "t"], italic: false },
                    { word: ["t", "h", "e"], italic: false },
                    { word: ["c", "r", "e", "a", "t", "i", "v", "e"], italic: false },
                    { word: ["m", "i", "n", "d", "s"], italic: false },
                    { word: ["b", "e", "h", "i", "n", "d"], italic: false },
                ].map(({ word }, wi) => (
                    <span key={wi} className="relative text-4xl box-border caret-transparent inline-block md:text-5xl">
                        {word.map((ch, ci) => (
                            <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block md:text-5xl">{ch}</span>
                        ))}
                        {"\u00A0"}
                    </span>
                ))}
                <span className="text-4xl italic font-normal box-border caret-transparent tracking-[-1px] font-instrument_serif md:text-5xl">
                    {[
                        ["o", "u", "r"],
                        ["s", "u", "c", "c", "e", "s", "s"],
                    ].map((word, wi) => (
                        <span key={wi} className="relative text-4xl box-border caret-transparent inline-block md:text-5xl">
                            {word.map((ch, ci) => (
                                <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block md:text-5xl">{ch}</span>
                            ))}
                            {"\u00A0"}
                        </span>
                    ))}
                </span>
            </h2>
        </div>
    );
};
