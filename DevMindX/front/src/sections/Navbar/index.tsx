import { useState, useEffect } from "react";
import { NavbarDesktop } from "@/sections/Navbar/components/NavbarDesktop";
import { NavbarMobileMenu } from "@/sections/Navbar/components/NavbarMobileMenu";

export const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        <>
            <div
                className={`fixed box-border caret-transparent h-24 w-full z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md" : ""
                    }`}
            >
                <div className="box-border caret-transparent z-[11]">
                    <div
                        role="banner"
                        className="relative box-border caret-transparent max-w-[1520px] w-full z-[5] mx-auto px-[25px] py-2.5"
                    >
                        <NavbarDesktop
                            mobileOpen={mobileOpen}
                            onMenuToggle={() => setMobileOpen((v) => !v)}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={() => setMobileOpen(false)}
            />

            <NavbarMobileMenu
                isOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
        </>
    );
};
