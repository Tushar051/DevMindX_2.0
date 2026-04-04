import { TeamSectionHeader } from "@/sections/TeamSection/components/TeamSectionHeader";
import { TeamGrid } from "@/sections/TeamSection/components/TeamGrid";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const TeamSection = () => {
    const ref = useScrollReveal();
    return (
        <section id="team" className="box-border pt-[60px] md:pt-[89px]" ref={ref}>
            <div className="box-border max-w-[1272px] mx-auto px-5">
                <div className="reveal">
                    <TeamSectionHeader />
                </div>
                <div className="reveal reveal-delay-1">
                    <TeamGrid />
                </div>
            </div>
        </section>
    );
};
