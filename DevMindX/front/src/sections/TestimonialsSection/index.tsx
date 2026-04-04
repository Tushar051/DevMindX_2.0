import { TestimonialsSectionHeader } from "@/sections/TestimonialsSection/components/TestimonialsSectionHeader";
import { TestimonialsGrid } from "@/sections/TestimonialsSection/components/TestimonialsGrid";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const TestimonialsSection = () => {
    const ref = useScrollReveal();
    return (
        <section className="box-border pt-[60px] md:pt-[107px]" ref={ref}>
            <div className="box-border max-w-[1272px] overflow-hidden mx-auto px-5">
                <div className="reveal">
                    <TestimonialsSectionHeader />
                </div>
                <div className="reveal reveal-delay-1">
                    <TestimonialsGrid />
                </div>
                <div className="reveal reveal-delay-2 items-stretch box-border gap-x-4 grid auto-cols-[1fr] grid-cols-1 grid-rows-[auto] justify-items-stretch gap-y-4 mt-6 md:grid-cols-[0.5fr_1fr]">
                    <div className="items-start bg-zinc-900 box-border gap-x-6 flex flex-col gap-y-6 p-5 rounded-2xl md:p-8">
                        <div className="text-white/60 font-medium box-border tracking-[1px] leading-[14px] uppercase">
                            Customer Stories
                        </div>
                        <p className="text-white text-2xl font-medium box-border leading-[28.8px] my-6">
                            <em className="italic box-border">
                                The real-time collaboration worked seamlessly. It felt just like
                                coding in VS Code but with a team online.&quot;
                            </em>
                            <strong className="font-bold box-border"> — Team Reviewer</strong>
                        </p>
                        <img
                            src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63348_image_5.png"
                            sizes="(max-width: 512px) 100vw, 512px, 100vw"
                            alt="testimonial-img"
                            className="box-border max-w-full w-full rounded-lg"
                        />
                    </div>
                    <div className="bg-zinc-900/10 box-border gap-x-6 flex flex-col min-h-[500px] gap-y-6 p-5 rounded-2xl md:p-8 hover:bg-zinc-900/15 transition-colors duration-300">
                        <div className="text-zinc-900/60 font-medium box-border tracking-[1px] uppercase">
                            Customer Stories
                        </div>
                        <h3 className="text-zinc-900 text-2xl font-medium box-border leading-[28.8px] mt-6 mb-2.5">
                            <em className="italic box-border">
                                Generating a full React app from a single prompt is something I
                                didn&#39;t think was possible in a browser.&quot;
                            </em>
                            <strong className="font-bold box-border">
                                —{" "}
                                <br />
                                Web Developer/ Students
                            </strong>
                        </h3>
                        <div className="items-start box-border flex flex-col justify-start mt-auto">
                            <p className="text-zinc-900 text-base font-medium box-border leading-4 mb-1">
                                Aditya / Abhishek
                            </p>
                            <div className="text-zinc-900/60 box-border">IEEE Head, I2IT</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
