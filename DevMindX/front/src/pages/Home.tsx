import { Hero } from "@/sections/Hero";
import { TechBanner } from "@/sections/TechBanner";
import { TechnologySection } from "@/sections/TechnologySection";
import { FeaturesSection } from "@/sections/FeaturesSection";
import { DemoSection } from "@/sections/DemoSection";
import { TeamSection } from "@/sections/TeamSection";
import { TestimonialsSection } from "@/sections/TestimonialsSection";
import { PricingSection } from "@/sections/PricingSection";
import { AwardsSection } from "@/sections/AwardsSection";
import { CTASection } from "@/sections/CTASection";

export const Home = () => {
    return (
        <div className="relative box-border">
            {/* Soft Pastel Gradient Background */}
            <div
                className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none z-0 opacity-100"
                style={{
                    background: 'radial-gradient(circle at 15% 15%, #e0f2fe 0%, transparent 50%), radial-gradient(circle at 85% 10%, #fef3c7 0%, transparent 50%)'
                }}
            />

            <div className="relative z-10 w-full">
                <Hero />
                <TechBanner />
                <TechnologySection />
                <FeaturesSection />
                <DemoSection />
                <TeamSection />
                <TestimonialsSection />
                <PricingSection />
                <AwardsSection />
                <CTASection />
            </div>
        </div>
    );
};
