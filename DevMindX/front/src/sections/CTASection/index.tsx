import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";

export const CTASection = () => {
    const ref = useScrollReveal();
    return (
        <section className="box-border pt-[60px] pb-0 md:pt-40 md:pb-10" ref={ref}>
            <div className="box-border max-w-[1272px] mx-auto px-5">
                <div className="reveal bg-[url('https://cdn.prod.website-files.com/69d01fffb4b1be95e3c63266/69d02000b4b1be95e3c6330d_bg-c2a.png')] bg-repeat-x box-border border border-zinc-900/10 bg-right-bottom px-5 py-10 rounded-3xl border-solid md:px-[60px] md:py-[120px] hover:shadow-lg transition-shadow duration-300">
                    <div className="items-center box-border flex flex-col justify-start max-w-[1032px] text-center mx-auto">
                        <h3
                            aria-label="Intelligent Development for bold developers"
                            className="text-4xl font-medium box-border leading-[43.2px] mb-3 md:text-5xl md:leading-[57.6px]"
                        >
                            Intelligent Development for{" "}
                            <em className="italic box-border">bold developers</em>
                        </h3>
                        <p className="text-zinc-900/60 text-base box-border mb-6">
                            Ready to build smarter? DevMindX brings AI-powered code
                            generation, real-time collaboration, and a full browser-based IDE
                            together in one platform — built for developers who move fast.
                        </p>
                        <Link
                            to="/features"
                            className="relative overflow-hidden text-white text-base font-medium items-center bg-zinc-900 box-border gap-x-4 flex justify-center leading-4 max-w-full gap-y-4 border pl-5 pr-2 py-[9px] rounded-[45px] border-solid border-zinc-900 hover:bg-zinc-700 hover:shadow-lg hover:shadow-zinc-400/30 hover:-translate-y-px active:scale-[0.97] transition-all duration-300 group cursor-pointer"
                        >
                            <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
                            <div className="box-border relative z-10">Try DevMindX</div>
                            <div className="items-center bg-white box-border flex h-8 justify-center w-8 rounded-[40px] relative z-10 transition-transform duration-300 group-hover:rotate-45">
                                <img
                                    src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632d1_arrow-top-right.png"
                                    alt="arrow-icon"
                                    className="box-border max-w-full"
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
