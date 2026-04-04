import { Link } from "react-router-dom";

type NavItem =
    | { href: string; label: string; spa?: undefined }
    | { href: string; label: string; spa: true };

const links: NavItem[] = [
    { href: "#home", label: "Home" },
    { href: "#technology", label: "Technology" },
    { href: "/features", label: "Features", spa: true },
    { href: "#demo", label: "Demo" },
    { href: "#team", label: "Team" },
    { href: "#pricing", label: "Pricing" },
    { href: "#awards", label: "Awards" },
];

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export const NavbarMobileMenu = ({ isOpen, onClose }: Props) => {
    return (
        <div
            className={`fixed top-0 right-0 h-full max-w-[300px] w-full z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
                }`}
        >
            <div className="bg-white h-full w-full shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-900/10">
                    <p className="text-zinc-900 text-base font-semibold">Menu</p>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <img
                            alt="close"
                            src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63318_cross-black.svg"
                            className="w-5 h-5"
                        />
                    </button>
                </div>

                {/* Links */}
                <nav className="flex-1 overflow-y-auto">
                    <ul role="list" className="flex flex-col gap-y-1 p-4 list-none">
                        {links.map((link, i) => (
                            <li key={link.href}>
                                {link.spa ? (
                                    <Link
                                        to={link.href}
                                        onClick={onClose}
                                        className="block text-zinc-900 text-base font-medium px-4 py-3 rounded-xl hover:bg-zinc-900/5 transition-colors"
                                        style={{ transitionDelay: isOpen ? `${i * 40}ms` : "0ms" }}
                                    >
                                        {link.label}
                                    </Link>
                                ) : (
                                    <a
                                        href={link.href}
                                        onClick={onClose}
                                        className="block text-zinc-900 text-base font-medium px-4 py-3 rounded-xl hover:bg-zinc-900/5 transition-colors"
                                        style={{ transitionDelay: isOpen ? `${i * 40}ms` : "0ms" }}
                                    >
                                        {link.label}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* CTA */}
                <div className="p-4 border-t border-zinc-900/10">
                    <Link
                        to="/features"
                        onClick={onClose}
                        className="flex items-center justify-between bg-zinc-900 text-white px-5 py-3 rounded-[25px] hover:bg-zinc-800 active:scale-[0.97] transition-all duration-200 group"
                    >
                        <span className="text-base font-medium">Try DevMindX</span>
                        <div className="items-center bg-white flex h-8 justify-center w-8 rounded-full transition-transform duration-200 group-hover:rotate-12">
                            <img
                                src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632d1_arrow-top-right.png"
                                alt=""
                                className="h-2 w-2"
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};
