import { Link } from "react-router-dom";

export const FeaturesCTA = () => {
    return (
        <div className="bg-zinc-900 box-border mt-12 p-5 rounded-3xl md:px-12 md:py-8">
            <div className="items-center box-border gap-x-5 flex flex-wrap justify-center gap-y-5 text-center pl-1.5 md:justify-between md:text-start">
                <div className="box-border text-center md:text-start">
                    <p className="text-white text-2xl font-medium box-border leading-6 text-center mb-2.5 md:text-start">
                        See DevMindX in Action.
                    </p>
                    <p className="text-white text-2xl font-medium box-border leading-6 text-center mt-0.5 md:text-start">
                        Start Building Smarter with AI Today!
                    </p>
                </div>
                <Link
                    to="/features"
                    className="relative overflow-hidden text-zinc-900 text-base font-medium items-center bg-white box-border gap-x-4 flex h-12 justify-center leading-4 max-w-full gap-y-4 text-center border pl-5 pr-2 rounded-[45px] border-solid border-white hover:bg-zinc-100 hover:shadow-md hover:-translate-y-px active:scale-[0.97] transition-all duration-300 group cursor-pointer"
                >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-zinc-900/5 to-transparent skew-x-[-20deg]" />
                    <div className="box-border relative z-10">Try DevMindX</div>
                    <div className="items-center bg-zinc-900 box-border flex h-8 justify-center w-8 rounded-[40px] relative z-10 transition-transform duration-300 group-hover:rotate-45">
                        <img
                            src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632e0_arrow-top-right-dark.svg"
                            alt="arrow-icon"
                            className="box-border max-w-full w-2.5"
                        />
                    </div>
                </Link>
            </div>
        </div>
    );
};
