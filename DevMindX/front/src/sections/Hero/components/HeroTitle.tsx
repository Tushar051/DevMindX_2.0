import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const HeroTitle = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Trigger floating animation safely after initial render
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="items-center box-border flex flex-col justify-center max-w-[1272px] text-center mx-auto px-5">
            <h1
                aria-label="DevMindX — The AI-Powered IDE That Codes With You"
                className="text-zinc-900 text-5xl font-medium box-border leading-[1.1] max-w-[1400px] overflow-visible md:text-[70px]"
            >
                <strong className="text-6xl font-bold box-border leading-[1.1] tracking-tight md:text-[90px] lg:text-[120px]">
                    <span 
                        className={`inline-block transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isMounted ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-md translate-y-12"}`}
                    >
                        DevMindX
                    </span>
                </strong>
                <br />
                <span className="text-4xl italic font-normal box-border tracking-[normal] leading-[1.1] font-instrument_serif md:text-[85px] lg:text-[110px]">
                    <span className="whitespace-nowrap">
                        {['The', 'AI-Powered', 'IDE', 'That'].map((word, i) => (
                            <span 
                                key={`top-${i}`} 
                                style={{ transitionDelay: `${200 + (i * 100)}ms` }} 
                                className={`inline-block transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isMounted ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-md translate-y-12"}`}
                            >
                                {word}&nbsp;
                            </span>
                        ))}
                    </span> 
                    <br className="hidden md:block"/> 
                    <span className="inline-block mt-2 md:mt-0">
                        {['Codes', 'With', 'You'].map((word, i) => (
                            <span 
                                key={`bottom-${i}`} 
                                style={{ transitionDelay: `${600 + (i * 100)}ms` }} 
                                className={`inline-block transition-all duration-[1200ms] ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isMounted ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-md translate-y-12"}`}
                            >
                                {word}{i !== 2 ? '\u00A0' : ''}
                            </span>
                        ))}
                    </span>
                </span>
            </h1>

            <p 
                style={{ transitionDelay: '300ms' }}
                className={`text-zinc-900/60 text-base box-border tracking-[0.4px] leading-[22.4px] max-w-[700px] mx-auto pt-4 transition-all duration-[1000ms] ease-out transform ${
                    isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
            >
                DevMindX turns your ideas into production-ready code instantly. Powered
                by Gemini AI — code, collaborate, and ship, all from your browser.
            </p>

            <div 
                style={{ transitionDelay: '500ms' }}
                className={`items-center box-border gap-x-8 flex flex-wrap justify-center gap-y-4 mt-8 transition-all duration-[1000ms] ease-out transform ${
                    isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
            >
                {/* CTA button */}
                <Link
                    to="/features"
                    className="text-base items-center bg-indigo-600 box-border flex h-16 justify-between max-w-full w-64 border border-indigo-600 pl-5 pr-3 py-2 rounded-[33px] border-solid hover:bg-indigo-700 active:scale-[0.97] transition-all duration-200 group shadow-lg shadow-indigo-600/30"
                >
                    <div className="text-white font-medium box-border leading-[22.4px] text-left">
                        Get Started
                    </div>
                    <div className="items-center bg-white box-border flex h-10 justify-center w-10 rounded-[45px] transition-transform duration-200 group-hover:rotate-12">
                        <img
                            src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632d1_arrow-top-right.png"
                            alt="arrow-top"
                            className="box-border max-w-full"
                        />
                    </div>
                </Link>

                {/* Social proof */}
                <div className="items-center box-border gap-x-4 flex flex-wrap justify-center gap-y-4 mt-2.5 md:flex-nowrap md:mt-0">
                    <div className="box-border flex">
                        {[
                            "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632cf_Ellipse_21.jpg",
                            "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632d0_Ellipse_22.jpg",
                            "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632ce_Ellipse_23.jpg",
                            "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632cd_Ellipse_24.jpg",
                        ].map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`avatar-${i + 1}`}
                                className="box-border inline-block -ml-2 first:ml-0 max-w-full w-10 rounded-full border-2 border-white"
                            />
                        ))}
                    </div>
                    <div className="items-center box-border flex justify-center text-left md:block">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4].map((i) => (
                                <img key={i} src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6333b_star-icon.svg" alt="star" className="box-border max-w-full inline-block" />
                            ))}
                            <img src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6333a_star-half-icon.svg" alt="star-half" className="box-border max-w-full inline-block" />
                        </div>
                        <p className="text-zinc-900/60 text-base box-border">Trusted by 200+ clients</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
