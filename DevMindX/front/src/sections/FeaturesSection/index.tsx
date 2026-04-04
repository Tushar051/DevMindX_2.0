import { FeaturesSectionHeader } from "@/sections/FeaturesSection/components/FeaturesSectionHeader";
import { FeatureCards } from "@/sections/FeaturesSection/components/FeatureCards";
import { FeaturesCTA } from "@/sections/FeaturesSection/components/FeaturesCTA";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const FeaturesSection = () => {
    const ref = useScrollReveal();
    return (
        <section id="features" className="box-border" ref={ref}>
            <div className="box-border max-w-[1272px] mx-auto pt-[60px] px-5 md:pt-40">
                <div className="reveal">
                    <FeaturesSectionHeader />
                </div>
                <div className="reveal reveal-delay-1">
                    <FeatureCards />
                </div>
                <div className="reveal reveal-delay-2">
                    <FeaturesCTA />
                </div>
            </div>
        </section>
    );
};
