import { TechSectionHeader } from "@/sections/TechnologySection/components/TechSectionHeader";
import { TechStats } from "@/sections/TechnologySection/components/TechStats";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const TechnologySection = () => {
    const ref = useScrollReveal();
    return (
        <section id="technology" className="font-medium box-border caret-transparent pt-[60px] md:pt-40" ref={ref}>
            <div className="box-border max-w-[1272px] mx-auto px-5">
                <div className="items-center box-border gap-x-[50px] flex flex-col justify-center gap-y-[50px] md:gap-x-16 md:gap-y-16">
                    <div className="reveal w-full flex justify-center">
                        <TechSectionHeader />
                    </div>
                    <div className="reveal reveal-delay-2 w-full">
                        <TechStats />
                    </div>
                </div>
            </div>
        </section>
    );
};
