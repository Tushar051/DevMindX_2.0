export const TestimonialsGrid = () => {
    return (
        <div className="box-border caret-transparent gap-x-5 grid auto-cols-[1fr] grid-cols-[2.25fr] grid-rows-[auto] gap-y-5 mt-10 md:gap-x-6 md:grid-cols-[2.25fr_1fr] md:gap-y-6 md:mt-20">
            <div className="bg-[url('https://cdn.prod.website-files.com/69d01fffb4b1be95e3c63266/69d02000b4b1be95e3c632fc_bg-cover.jpg')] box-border caret-transparent flex flex-col min-h-[480px] min-w-[auto] bg-[position:0px_0px] p-5 rounded-2xl md:p-8">
                <div className="text-white/60 font-medium box-border caret-transparent tracking-[1px] min-h-[auto] min-w-[auto] uppercase">
                    Customer Stories
                </div>
                <div className="items-start box-border caret-transparent gap-x-6 flex flex-col justify-start min-h-[auto] min-w-[auto] gap-y-6 mt-auto">
                    <p className="text-white text-2xl font-medium box-border caret-transparent leading-[28.8px] min-h-[auto] min-w-[auto]">
                        <em className="italic box-border caret-transparent">
                            DevMindX completely changed how I think about browser-based
                            development. The AI generation feature scaffolded my entire
                            project in seconds.&quot;
                        </em>
                        <strong className="font-bold box-border caret-transparent">
                            — Beta Tester / Classmate
                        </strong>
                    </p>
                    <div className="box-border caret-transparent min-h-[auto] min-w-[auto]">
                        <div className="text-white text-base font-medium box-border caret-transparent">
                            Gauri A.
                        </div>
                        <div className="text-white/60 box-border caret-transparent">
                            Web Developer, SIH Finalist 2024
                        </div>
                    </div>
                </div>
            </div>
            <div className="items-start bg-amber-200 box-border caret-transparent flex flex-col justify-start min-h-[auto] min-w-[auto] p-5 rounded-2xl md:p-8">
                <div className="text-zinc-900/60 font-medium box-border caret-transparent tracking-[1px] min-h-[auto] min-w-[auto] uppercase">
                    Facts &amp; Numbers
                </div>
                <p className="text-zinc-900 text-5xl font-medium box-border caret-transparent leading-[72px] min-h-[auto] min-w-[auto]">
                    8.5/10
                </p>
                <p className="text-zinc-900 text-2xl font-medium box-border caret-transparent leading-[28.8px] min-h-[auto] min-w-[auto] mb-2.5">
                    Security score achieved in independent audit
                </p>
                <div className="box-border caret-transparent min-h-[auto] min-w-[auto] mt-auto">
                    <p className="text-zinc-900 text-5xl font-medium box-border caret-transparent leading-[72px]">
                        45ms
                    </p>
                </div>
                <p className="text-zinc-900 text-2xl font-medium box-border caret-transparent leading-[28.8px] min-h-[auto] min-w-[auto] mb-2.5">
                    Average editor response time
                </p>
            </div>
        </div>
    );
};
