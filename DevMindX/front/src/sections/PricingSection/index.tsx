import { PricingSectionHeader } from "@/sections/PricingSection/components/PricingSectionHeader";
import { PricingGrid } from "@/sections/PricingSection/components/PricingGrid";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const PricingSection = () => {
    const ref = useScrollReveal();
    return (
        <section id="pricing" className="bg-white box-border pt-[60px] md:pt-40" ref={ref}>
            <div className="items-center box-border flex flex-col justify-center max-w-[1272px] text-center mx-auto px-5">
                <div className="reveal">
                    <PricingSectionHeader />
                </div>
                <div className="reveal reveal-delay-1 w-full">
                    <PricingGrid />
                </div>
            </div>
        </section>
    );
};
