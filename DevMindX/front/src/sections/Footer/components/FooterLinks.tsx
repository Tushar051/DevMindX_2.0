export const FooterLinks = () => {
    return (
        <div className="items-start box-border gap-x-5 grid auto-cols-[1fr] grid-cols-1 grid-rows-[auto] gap-y-8 md:gap-x-4 md:grid-cols-[1fr_1fr_1fr] md:gap-y-4">
            <div className="box-border">
                <div className="text-zinc-900 text-base font-medium box-border mb-4">Sitemap</div>
                <ul role="list" className="box-border gap-x-2 flex flex-col list-none gap-y-2 mb-2.5 pl-0 md:gap-x-3 md:gap-y-3">
                    {[
                        { href: "#home", label: "Home" },
                        { href: "#features", label: "Features" },
                        { href: "#pricing", label: "Pricing" },
                        { href: "#awards", label: "Awards" },
                    ].map((link) => (
                        <li key={link.href} className="text-zinc-900 text-base box-border leading-[22.4px]">
                            <a href={link.href} className="text-zinc-900/60 hover:text-indigo-600 transition-colors duration-200">
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="box-border">
                <div className="text-zinc-900 text-base font-medium box-border mb-4">Other Pages</div>
                <ul role="list" className="box-border gap-x-2 flex flex-col list-none gap-y-2 mb-2.5 pl-0 md:gap-x-3 md:gap-y-3">
                    {["Contact Us", "Privacy Policy"].map((item) => (
                        <li key={item} className="text-zinc-900/60 text-base box-border leading-[22.4px] hover:text-indigo-600 transition-colors duration-200 cursor-pointer">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="box-border">
                <div className="text-zinc-900 text-base font-medium box-border mb-4">Contact Details</div>
                <ul role="list" className="box-border gap-x-2 flex flex-col list-none gap-y-2 mb-2.5 pl-0 md:gap-x-3 md:gap-y-3">
                    <li className="text-zinc-900/60 text-base box-border leading-[22.4px] tracking-[0.5px]">
                        Pune, Maharashtra, India
                    </li>
                    <li className="text-base box-border leading-[22.4px]">
                        <a href="mailto:webdevx.ai@gmail.com" className="text-zinc-900/60 hover:text-indigo-600 transition-colors duration-200">
                            webdevx.ai@gmail.com
                        </a>
                    </li>
                    <li className="text-base box-border leading-[22.4px]">
                        <a href="tel:+01051923556" className="text-zinc-900/60 hover:text-indigo-600 transition-colors duration-200">
                            0105 192 3556
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};
