import { DemoSectionHeader } from "@/sections/DemoSection/components/DemoSectionHeader";
import { DemoFeatureList } from "@/sections/DemoSection/components/DemoFeatureList";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const DemoSection = () => {
    const ref = useScrollReveal();
    return (
        <section id="demo" className="box-border pt-[60px] md:pt-40" ref={ref}>
            <div className="box-border max-w-[1272px] mx-auto px-5">
                <div className="items-center box-border gap-x-10 flex flex-col gap-y-10 md:gap-x-20 md:gap-y-20">
                    <div className="reveal w-full flex justify-center">
                        <DemoSectionHeader />
                    </div>
                    <div className="reveal reveal-delay-1 w-full">
                        <DemoFeatureList />
                    </div>
                </div>
            </div>
        </section>
    );
};
