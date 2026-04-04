export const HeroActions = () => {
    return (
        <div className="items-center box-border caret-transparent gap-x-8 flex flex-wrap auto-cols-[1fr] grid-cols-[1fr_1fr] grid-rows-[auto_auto] justify-center min-h-[auto] min-w-[auto] gap-y-4 mt-8">
            <div className="box-border caret-transparent min-h-[auto] min-w-[auto]">
                <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="relative overflow-hidden text-blue-700 text-base items-center bg-indigo-600 box-border caret-transparent flex h-16 justify-between max-w-full w-64 border border-indigo-600 pl-5 pr-3 py-2 rounded-[33px] border-solid group transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300 active:scale-[0.97] cursor-pointer"
                >
                    {/* shine sweep */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" />
                    <div className="text-white font-medium box-border caret-transparent leading-[22.4px] min-h-[auto] min-w-[auto] text-left relative z-10">
                        Get Started
                    </div>
                    <div className="items-center bg-white box-border caret-transparent flex h-10 justify-center min-h-[auto] min-w-[auto] w-10 rounded-[45px] relative z-10 transition-transform duration-300 group-hover:rotate-45">
                        <img
                            src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632d1_arrow-top-right.png"
                            alt="arrow-top"
                            className="box-border caret-transparent max-w-full min-h-[auto] min-w-[auto]"
                        />
                    </div>
                </a>
            </div>
            <div className="items-center box-border caret-transparent gap-x-4 flex flex-wrap justify-center min-h-[auto] min-w-[auto] gap-y-4 mt-2.5 md:flex-nowrap md:mt-0">
                <div className="box-border caret-transparent min-h-[auto] min-w-[auto]">
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632cf_Ellipse_21.jpg"
                        alt="avatar-1"
                        className="box-border caret-transparent inline-block ml-[-9px] max-w-full w-10 rounded-[100%] border-2 border-solid border-white"
                    />
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632d0_Ellipse_22.jpg"
                        alt="avatar-2"
                        className="box-border caret-transparent inline-block ml-[-9px] max-w-full w-10 rounded-[100%] border-2 border-solid border-white"
                    />
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632ce_Ellipse_23.jpg"
                        alt="avatar-3"
                        className="box-border caret-transparent inline-block ml-[-9px] max-w-full w-10 rounded-[100%] border-2 border-solid border-white"
                    />
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632cd_Ellipse_24.jpg"
                        alt="avatar-4"
                        className="box-border caret-transparent inline-block ml-[-9px] max-w-full w-10 rounded-[100%] border-2 border-solid border-white"
                    />
                </div>
                <div className="items-center box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto] text-left md:[align-items:normal] md:block md:justify-normal">
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6333b_star-icon.svg"
                        alt="star-icon"
                        className="box-border caret-transparent block max-w-full min-h-[auto] min-w-[auto] md:inline-block md:min-h-0 md:min-w-0"
                    />
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6333b_star-icon.svg"
                        alt="star-icon"
                        className="box-border caret-transparent block max-w-full min-h-[auto] min-w-[auto] md:inline-block md:min-h-0 md:min-w-0"
                    />
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6333b_star-icon.svg"
                        alt="star-icon"
                        className="box-border caret-transparent block max-w-full min-h-[auto] min-w-[auto] md:inline-block md:min-h-0 md:min-w-0"
                    />
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6333b_star-icon.svg"
                        alt="star-icon"
                        className="box-border caret-transparent block max-w-full min-h-[auto] min-w-[auto] md:inline-block md:min-h-0 md:min-w-0"
                    />
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6333a_star-half-icon.svg"
                        alt="star-icon"
                        className="box-border caret-transparent block max-w-full min-h-[auto] min-w-[auto] md:inline-block md:min-h-0 md:min-w-0"
                    />
                    <p className="text-zinc-900/60 text-base box-border caret-transparent min-h-[auto] min-w-[auto] md:min-h-0 md:min-w-0">
                        Trusted by 200+ clients
                    </p>
                </div>
            </div>
        </div>
    );
};
