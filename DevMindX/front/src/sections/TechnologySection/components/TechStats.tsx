import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

const CountUp = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
    const ref = useRef<HTMLParagraphElement>(null);
    const inView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

    useEffect(() => {
        if (inView && ref.current) {
            const controls = animate(1, to, {
                duration: 2.5,
                ease: "easeOut",
                onUpdate(value) {
                    if (ref.current) {
                        ref.current.textContent = Math.floor(value).toString() + suffix;
                    }
                },
            });
            return () => controls.stop();
        }
    }, [inView, to, suffix]);

    return (
        <p ref={ref} className="text-zinc-900 text-7xl items-start box-border caret-transparent flex justify-center leading-[72px] min-h-[auto] min-w-[auto] md:text-[130px] md:leading-[130px]">
            1{suffix}
        </p>
    );
};

export const TechStats = () => {
    return (
        <div className="box-border caret-transparent gap-x-2.5 grid auto-cols-[1fr] grid-cols-[1fr] grid-rows-[auto] min-h-[auto] min-w-[auto] gap-y-2.5 w-full md:gap-x-4 md:grid-cols-[1fr_1fr_1fr] md:gap-y-4">
            <div className="box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto]">
                <div className="items-center box-border caret-transparent gap-x-2.5 flex flex-col justify-center min-h-[auto] min-w-[auto] gap-y-2.5 w-full px-2.5 py-5 md:py-8">
                    <div className="items-start box-border caret-transparent flex justify-start min-h-[auto] min-w-[auto]">
                        <p className="text-zinc-900 text-6xl box-border caret-transparent leading-[18px] min-h-[auto] min-w-[auto] md:text-[80px] md:leading-6">
                            +
                        </p>
                        <CountUp to={40} />
                    </div>
                    <p className="text-zinc-900/60 text-base font-normal box-border caret-transparent min-h-[auto] min-w-[auto]">
                        Concurrent Users Supported
                    </p>
                </div>
                <div className="bg-zinc-900/10 box-border caret-transparent hidden h-3/5 justify-end min-h-0 min-w-0 w-px my-auto md:flex md:min-h-[auto] md:min-w-[auto]"></div>
            </div>
            <div className="box-border caret-transparent flex justify-center min-h-[auto] min-w-[auto]">
                <div className="items-center box-border caret-transparent gap-x-2.5 flex flex-col justify-center min-h-[auto] min-w-[auto] gap-y-2.5 w-full px-2.5 py-5 md:py-8">
                    <div className="items-start box-border caret-transparent flex justify-start min-h-[auto] min-w-[auto]">
                        <p className="text-zinc-900 text-6xl box-border caret-transparent leading-[18px] min-h-[auto] min-w-[auto] md:text-[80px] md:leading-6">
                            +
                        </p>
                        <CountUp to={15} />
                    </div>
                    <p className="text-zinc-900/60 text-base font-normal box-border caret-transparent min-h-[auto] min-w-[auto]">
                        Programming Languages
                    </p>
                </div>
                <div className="bg-zinc-900/10 box-border caret-transparent hidden h-3/5 justify-end min-h-0 min-w-0 w-px my-auto md:flex md:min-h-[auto] md:min-w-[auto]"></div>
            </div>
            <div className="items-center box-border caret-transparent gap-x-2.5 flex flex-col justify-center min-h-[auto] min-w-[auto] gap-y-2.5 w-full px-2.5 py-5 md:py-8">
                <div className="items-start box-border caret-transparent flex min-h-[auto] min-w-[auto]">
                    <p className="text-zinc-900 text-6xl box-border caret-transparent leading-[18px] min-h-[auto] min-w-[auto] md:text-[80px] md:leading-6">
                        +
                    </p>
                    <CountUp to={45} suffix="ms" />
                </div>
                <p className="text-zinc-900/60 text-base font-normal box-border caret-transparent min-h-[auto] min-w-[auto]">
                    Average Editor Response
                </p>
            </div>
        </div>
    );
};
