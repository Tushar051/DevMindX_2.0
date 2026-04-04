import { TechMarquee } from "@/sections/TechBanner/components/TechMarquee";

export const TechBanner = () => {
    return (
        <section className="box-border py-10 md:pt-[21px] md:pb-0">
            <div className="box-border max-w-[1272px] mx-auto px-[15px] md:px-0">
                <div className="items-center box-border gap-x-4 flex justify-center gap-y-4 px-[25px]">
                    <div className="bg-[linear-gradient(90deg,rgba(27,30,29,0),rgba(27,29,30,0.1)_80%)] box-border hidden h-0.5 max-w-[170px] w-[1920px] md:block"></div>
                    <p className="text-zinc-900/60 text-base font-medium items-center box-border gap-x-0 flex justify-center gap-y-0 text-center mt-5 mb-0 md:text-start md:mb-5">
                        Built on world-class technologies
                    </p>
                    <div className="bg-[linear-gradient(90deg,rgba(27,29,30,0.1),rgba(27,30,29,0)_81%)] box-border hidden h-0.5 max-w-[210px] w-[210px] md:block"></div>
                </div>
                <TechMarquee />
            </div>
        </section>
    );
};
