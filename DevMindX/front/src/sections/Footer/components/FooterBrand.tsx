export const FooterBrand = () => {
    return (
        <div className="items-start box-border gap-x-[18px] flex flex-col max-w-[475px] gap-y-[18px] md:gap-x-6 md:gap-y-6">
            <a href="#home" className="box-border inline-block">
                <img
                    src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d0310a83b16db1a5d76f71_Glow_of_the_futuristic_cube.png"
                    sizes="(max-width: 479px) 100vw, 46px"
                    alt="DevMindX logo"
                    className="box-border inline-block max-w-full w-[46px] hover:opacity-80 transition-opacity duration-200"
                />
            </a>
            <div className="text-zinc-900/60 text-base box-border tracking-[0.5px] leading-[22.4px]">
                <em className="italic box-border">
                    The AI-powered IDE that codes with you. Built for developers who move
                    fast.
                </em>
            </div>
            <div className="box-border gap-x-4 flex gap-y-4">
                {[
                    { href: "https://x.com/", src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6330e_si-twitter.svg", alt: "Twitter" },
                    { href: "https://linkedin.com/", src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63311_si-linkedin.svg", alt: "LinkedIn" },
                    { href: "https://instagram.com/", src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63310_si-insta.svg", alt: "Instagram" },
                    { href: "https://dribbble.com/", src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6330f_si-dribbble.svg", alt: "Dribbble" },
                ].map((social) => (
                    <a
                        key={social.alt}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-border block opacity-60 hover:opacity-100 transition-opacity duration-200 hover:scale-110 transform"
                    >
                        <img src={social.src} alt={social.alt} className="box-border inline-block max-w-full" />
                    </a>
                ))}
            </div>
            <div className="text-zinc-900/60 text-base box-border leading-[22.4px]">
                DevMind<strong className="font-bold box-border">X</strong>
            </div>
        </div>
    );
};
