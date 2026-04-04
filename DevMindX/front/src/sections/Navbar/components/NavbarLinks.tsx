import { Link } from "react-router-dom";

type Item =
    | { href: string; label: string; active?: boolean; to?: never }
    | { to: string; label: string; active?: boolean; href?: never };

const links: Item[] = [
    { href: "#home", label: "Home", active: true },
    { href: "#technology", label: "Technology" },
    { to: "/features", label: "Features" },
    { href: "#demo", label: "Demo" },
    { href: "#team", label: "Team" },
    { href: "#pricing", label: "Price" },
    { href: "#awards", label: "Awards" },
];

export const NavbarLinks = () => {
    return (
        <ul
            role="list"
            className="items-center bg-white shadow-[rgba(0,0,0,0.05)_0px_8px_50px_0px] box-border hidden flex-wrap justify-around list-none border border-zinc-900/10 mt-2.5 pt-5 pb-[30px] px-5 rounded-[20px] border-solid md:bg-transparent md:shadow-none md:flex md:flex-row md:flex-nowrap md:justify-between md:mt-0 md:p-0 md:rounded-[999px]"
        >
            <li className="bg-zinc-900/10 box-border gap-x-1.5 flex min-h-0 min-w-0 gap-y-1.5 px-2.5 py-1 rounded-[999px]">
                {links.map((link) => {
                    const className = `text-base font-medium box-border block tracking-[0.25px] px-[11px] py-2 rounded-[999px] transition-all duration-200 ${
                        link.active
                            ? "text-zinc-900 bg-white shadow-sm"
                            : "text-zinc-900/60 hover:text-zinc-900 hover:bg-white hover:shadow-sm"
                    }`;
                    return "to" in link && link.to ? (
                        <Link key={link.to} to={link.to} className={className}>
                            {link.label}
                        </Link>
                    ) : (
                        <a key={link.href} href={link.href} className={className}>
                            {link.label}
                        </a>
                    );
                })}
            </li>
        </ul>
    );
};
