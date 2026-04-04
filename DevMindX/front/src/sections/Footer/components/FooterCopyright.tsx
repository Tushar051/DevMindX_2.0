export const FooterCopyright = () => {
    return (
        <div className="border-t border-zinc-900/10 box-border pt-[15px]">
            <div className="box-border max-w-[1272px] mx-auto">
                <div className="items-center box-border gap-x-5 flex flex-wrap justify-start gap-y-3 md:justify-between">
                    <div className="text-zinc-900/60 text-base box-border tracking-[0.4px] leading-[22.4px] text-left">
                        ©2026 DevMindX. All Rights Reserved. Built with ❤️ in India
                    </div>
                    <div className="items-center box-border gap-x-5 flex justify-center gap-y-5">
                        {[
                            { href: "#", label: "Style Guide" },
                            { href: "#", label: "Licenses" },
                            { href: "#", label: "Changelog" },
                        ].map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={(e) => e.preventDefault()}
                                className="text-zinc-900/60 text-base box-border hover:text-indigo-600 transition-colors duration-200"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
