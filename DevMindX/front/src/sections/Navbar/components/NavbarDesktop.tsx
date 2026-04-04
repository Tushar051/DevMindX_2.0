import { NavbarLogo } from "@/sections/Navbar/components/NavbarLogo";
import { NavbarLinks } from "@/sections/Navbar/components/NavbarLinks";
import { NavbarCTA } from "@/sections/Navbar/components/NavbarCTA";

type Props = {
    mobileOpen: boolean;
    onMenuToggle: () => void;
};

export const NavbarDesktop = ({ mobileOpen, onMenuToggle }: Props) => {
    return (
        <div className="relative items-center bg-transparent box-border caret-transparent gap-x-0 flex justify-between max-w-[1272px] gap-y-0 z-20 mx-auto px-[15px] py-[9px] rounded-[999px] transition-all duration-300">
            <NavbarLogo />
            <NavbarLinks />
            <NavbarCTA mobileOpen={mobileOpen} onMenuToggle={onMenuToggle} />
        </div>
    );
};
