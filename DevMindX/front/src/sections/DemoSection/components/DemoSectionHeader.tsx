import { useTextScrollReveal } from "@/hooks/useTextScrollReveal";

export const DemoSectionHeader = () => {
  const ref = useTextScrollReveal<HTMLDivElement>({ threshold: 0.2, staggerMs: 28 });
  return (
    <div ref={ref} className="items-center box-border caret-transparent gap-x-4 flex auto-cols-[1fr] grid-cols-[1fr] grid-rows-[auto] justify-center min-h-[auto] min-w-[auto] gap-y-4">
      <h2
        aria-label="Everything You Need, Right in Your  Browser"
        className="text-zinc-900 text-4xl font-medium box-border caret-transparent leading-[43.2px] max-w-[500px] min-h-[auto] min-w-[auto] text-center md:text-5xl md:leading-[57.6px] md:max-w-screen-md"
      >
        {[
          ["E", "v", "e", "r", "y", "t", "h", "i", "n", "g"],
          ["Y", "o", "u"],
          ["N", "e", "e", "d", ","],
          ["R", "i", "g", "h", "t"],
          ["i", "n"],
          ["Y", "o", "u", "r"],
        ].map((word, wi) => (
          <span key={wi} className="relative text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">
            {word.map((ch, ci) => (
              <span key={ci} className="letter relative text-black/20 text-4xl box-border caret-transparent inline-block leading-[43.2px] md:text-5xl md:leading-[57.6px]">{ch}</span>
            ))}
            {"\u00A0"}
          </span>
        ))}
        <span className="text-4xl italic font-normal box-border caret-transparent tracking-[-1px] leading-[43.2px] font-instrument_serif md:text-5xl md:leading-[57.6px]">
          {[["B", "r", "o", "w", "s", "e", "r"]].map((word, wi) => (
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
