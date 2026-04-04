import { FooterBrand } from "@/sections/Footer/components/FooterBrand";
import { FooterLinks } from "@/sections/Footer/components/FooterLinks";
import { FooterCopyright } from "@/sections/Footer/components/FooterCopyright";

export const Footer = () => {
    return (
        <footer className="relative box-border caret-transparent">
            <div className="box-border caret-transparent max-w-[1272px] mx-auto pt-5 pb-6 px-5 md:pt-20 before:accent-auto before:caret-transparent before:text-zinc-800 before:table before:text-sm before:not-italic before:normal-nums before:font-normal before:col-end-2 before:col-start-1 before:row-end-2 before:row-start-1 before:tracking-[normal] before:leading-5 before:list-outside before:list-disc before:pointer-events-auto before:text-start before:no-underline before:indent-[0px] before:normal-case before:visible before:border-separate before:font-inter_tight after:accent-auto after:caret-transparent after:clear-both after:text-zinc-800 after:table after:text-sm after:not-italic after:normal-nums after:font-normal after:col-end-2 after:col-start-1 after:row-end-2 after:row-start-1 after:tracking-[normal] after:leading-5 after:list-outside after:list-disc after:pointer-events-auto after:text-start after:no-underline after:indent-[0px] after:normal-case after:visible after:border-separate after:font-inter_tight">
                <div className="items-start box-border caret-transparent gap-x-[30px] flex flex-col grid-cols-[2fr] grid-rows-[auto] gap-y-[30px] my-10 md:gap-x-16 md:flex-row md:grid-cols-[2fr_1fr_1fr_1.25fr] md:gap-y-16 md:my-16">
                    <FooterBrand />
                    <FooterLinks />
                </div>
                <FooterCopyright />
            </div>
        </footer>
    );
};
