import { AwardsSectionHeader } from "@/sections/AwardsSection/components/AwardsSectionHeader";
import { AwardsList } from "@/sections/AwardsSection/components/AwardsList";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const AwardsSection = () => {
    const ref = useScrollReveal();
    return (
        <section id="awards" className="box-border pt-[60px] md:pt-0" ref={ref}>
            <div className="box-border max-w-[1272px] mx-auto px-5">
                <div className="reveal">
                    <AwardsSectionHeader />
                </div>
                <div className="reveal reveal-delay-1">
                    <AwardsList />
                </div>
            </div>
        </section>
    );
};
