import { useTextScrollReveal } from "@/hooks/useTextScrollReveal";

export const TechSectionHeader = () => {
    const ref = useTextScrollReveal<HTMLDivElement>({ threshold: 0.15, staggerMs: 22 });
    return (
        <div ref={ref} className="box-border caret-transparent gap-x-2.5 flex flex-col min-h-[auto] min-w-[auto] gap-y-2.5">
            <h2
                aria-label="Combining cutting-edge AI with a seamless browser-based IDE to transform the way developers think, build, and ship"
                className="text-zinc-900 text-[32px] box-border caret-transparent leading-[38.4px] mt-[-63px] min-h-[auto] min-w-[auto] text-center md:text-5xl md:leading-[57.6px]"
            >
                {[
                    ["C", "o", "m", "b", "i", "n", "i", "n", "g"],
                    ["c", "u", "t", "t", "i", "n", "g", "-", "e", "d", "g", "e"],
                    ["A", "I"],
                    ["w", "i", "t", "h"],
                    ["a"],
                    ["s", "e", "a", "m", "l", "e", "s", "s"],
                    ["b", "r", "o", "w", "s", "e", "r", "-", "b", "a", "s", "e", "d"],
                    ["I", "D", "E"],
                    ["t", "o"],
                    ["t", "r", "a", "n", "s", "f", "o", "r", "m"],
                    ["t", "h", "e"],
                    ["w", "a", "y"],
                    ["d", "e", "v", "e", "l", "o", "p", "e", "r", "s"],
                    ["t", "h", "i", "n", "k", ","],
                    ["b", "u", "i", "l", "d", ","],
                    ["a", "n", "d"],
                    ["s", "h", "i", "p"],
                ].map((word, wi) => (
                    <span key={wi} className="relative text-[32px] box-border caret-transparent inline-block leading-[38.4px] md:text-5xl md:leading-[57.6px]">
                        {word.map((ch, ci) => (
                            <span
                                key={ci}
                                className="letter relative text-black/20 text-[32px] box-border caret-transparent inline-block leading-[38.4px] md:text-5xl md:leading-[57.6px]"
                            >
                                {ch}
                            </span>
                        ))}
                        {"\u00A0"}
                    </span>
                ))}
            </h2>
            <div className="items-start box-border caret-transparent gap-x-3 flex flex-wrap justify-center min-h-[auto] min-w-[auto] gap-y-3 mt-[43px]">
                <div className="items-center bg-purple-400/20 box-border caret-transparent gap-x-3 flex justify-center min-h-[auto] min-w-[auto] gap-y-3 px-6 py-1 rounded-[999px]">
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632d8_Magic_Stick.svg"
                        alt="creativity-icon"
                        className="box-border caret-transparent max-w-full min-h-[auto] min-w-[auto]"
                    />
                    <p className="text-purple-400 text-[32px] italic font-normal box-border caret-transparent tracking-[-1px] leading-[38.4px] min-h-[auto] min-w-[auto] font-instrument_serif md:text-5xl md:leading-[57.6px]">
                        Creativity
                    </p>
                </div>
                <div className="items-center bg-blue-400/20 box-border caret-transparent gap-x-3 flex justify-center min-h-[auto] min-w-[auto] gap-y-3 px-6 py-1 rounded-[999px]">
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632da_Frame.svg"
                        alt="innovation-icon"
                        className="box-border caret-transparent max-w-full min-h-[auto] min-w-[auto]"
                    />
                    <p className="text-blue-400 text-[32px] italic font-normal box-border caret-transparent tracking-[-1px] leading-[38.4px] min-h-[auto] min-w-[auto] font-instrument_serif md:text-5xl md:leading-[57.6px]">
                        Innovation
                    </p>
                </div>
                <div className="bg-orange-300/20 box-border caret-transparent gap-x-3 flex min-h-[auto] min-w-[auto] gap-y-3 px-6 py-1 rounded-[999px]">
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632d9_Frame_(1).svg"
                        alt="strategy-icon"
                        className="box-border caret-transparent max-w-full min-h-[auto] min-w-[auto]"
                    />
                    <p className="text-orange-300 text-[32px] italic font-normal box-border caret-transparent leading-[38.4px] min-h-[auto] min-w-[auto] font-instrument_serif md:text-5xl md:leading-[57.6px]">
                        Strategy
                    </p>
                </div>
            </div>
        </div>
    );
};
