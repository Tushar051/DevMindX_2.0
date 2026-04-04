import { AwardCard } from "@/sections/AwardsSection/components/AwardCard";

export const AwardsList = () => {
    return (
        <div className="box-border caret-transparent gap-x-4 grid auto-cols-[1fr] grid-cols-[1fr] grid-rows-[auto] gap-y-4 mt-10 md:grid-cols-[1fr_1fr_1fr] md:mt-20">
            <AwardCard
                imageSrc="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63364_lineicons--webflow.svg"
                title="Google Solution Challenge"
                description={
                    <em className="italic box-border caret-transparent">
                        DevMindX recognized in the Top 100 projects globally out of
                        thousands of submissions worldwide.
                    </em>
                }
                year="2026"
            />
            <AwardCard
                imageSrc="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63301_icon-dribbble.svg"
                title="Microsoft Imagine Cup X"
                description="Awarded at Microsoft Imagine Cup X for outstanding innovation in AI-powered software development tools."
                year="2026"
            />
            <AwardCard
                imageSrc="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63365_logos--dailydev-icon.svg"
                title="Microsoft Imagine Cup X Junior"
                description="Honored at Microsoft Imagine Cup X Junior for delivering a production-ready AI development platform."
                year="2025"
            />
        </div>
    );
};
