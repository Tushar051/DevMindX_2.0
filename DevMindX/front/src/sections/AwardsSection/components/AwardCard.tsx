export type AwardCardProps = {
    imageSrc: string;
    title: string;
    description: React.ReactNode;
    year: string;
};

export const AwardCard = (props: AwardCardProps) => {
    return (
        <div className="box-border gap-x-[55px] flex flex-col gap-y-[55px] border border-zinc-900/10 p-[25px] rounded-2xl border-solid md:gap-x-16 md:gap-y-16 md:p-10 hover:border-zinc-900/30 hover:shadow-md transition-all duration-300 cursor-default group">
            <img
                src={props.imageSrc}
                alt=""
                className="aspect-square box-border h-8 max-w-full w-8 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="box-border">
                <div className="text-zinc-900/60 text-base box-border">{props.title}</div>
                <p className="text-zinc-900 text-2xl font-medium box-border leading-7 mt-3">
                    {props.description}
                </p>
            </div>
            <div className="text-zinc-900/60 text-base box-border">{props.year}</div>
        </div>
    );
};
