export const NavbarLogo = () => {
    return (
        <div className="items-center box-border caret-transparent gap-x-20 flex justify-center min-h-[auto] min-w-[auto] gap-y-20">
            <a
                href="/"
                aria-label="home"
                className="relative box-border caret-transparent block float-left min-h-[auto] min-w-[auto]"
            >
                <img
                    sizes="(max-width: 479px) 100vw, 66px"
                    alt=""
                    src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d0310a83b16db1a5d76f71_Glow_of_the_futuristic_cube.png"
                    className="box-border caret-transparent inline-block max-w-full w-[66px]"
                />
            </a>
        </div>
    );
};
