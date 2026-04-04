import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Props = {
    mobileOpen: boolean;
    onMenuToggle: () => void;
};

export const NavbarCTA = ({ mobileOpen, onMenuToggle }: Props) => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="items-center box-border gap-x-2.5 flex justify-center gap-y-2.5 md:block">
            <button
                onClick={onMenuToggle}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900/6 hover:bg-zinc-900/10 transition-colors md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
            >
                <span className="sr-only">{mobileOpen ? "Close" : "Open"} menu</span>
                <div className="w-5 flex flex-col gap-[5px] items-end">
                    <span className={`block h-0.5 bg-zinc-900 rounded-full transition-all duration-300 ${mobileOpen ? "w-5 rotate-45 translate-y-[7px]" : "w-5"}`} />
                    <span className={`block h-0.5 bg-zinc-900 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 w-5" : "w-3.5"}`} />
                    <span className={`block h-0.5 bg-zinc-900 rounded-full transition-all duration-300 ${mobileOpen ? "w-5 -rotate-45 -translate-y-[7px]" : "w-5"}`} />
                </div>
            </button>

            <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                    <Link
                        to="/app/profile"
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 px-3 py-2 rounded-full hover:bg-zinc-900/5"
                    >
                        <UserCircle className="h-4 w-4 shrink-0" aria-hidden />
                        Profile
                    </Link>
                ) : (
                    <Link
                        to="/login"
                        state={{ from: "/features" }}
                        className="text-sm font-medium text-zinc-700 hover:text-zinc-900 px-3 py-2 rounded-full hover:bg-zinc-900/5"
                    >
                        Log in
                    </Link>
                )}
                <Link
                    to="/features"
                    className="relative overflow-hidden text-base items-center bg-zinc-900 box-border gap-x-2.5 hidden h-12 justify-center leading-[48px] max-w-full gap-y-2.5 text-center border border-zinc-900 pl-5 pr-2 py-2 rounded-[25px] border-solid md:flex hover:bg-zinc-700 hover:shadow-md hover:-translate-y-px active:scale-[0.97] transition-all duration-200 group cursor-pointer"
                >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
                    <div className="text-white box-border relative z-10">Try DevMindX</div>
                    <div className="items-center bg-white box-border flex h-8 justify-center w-8 rounded-[25px] relative z-10 transition-transform duration-300 group-hover:rotate-45">
                        <img
                            src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632d1_arrow-top-right.png"
                            alt=""
                            className="aspect-[auto_8_/_8] box-border h-2 max-w-full w-2"
                        />
                    </div>
                </Link>
            </div>
        </div>
    );
};
