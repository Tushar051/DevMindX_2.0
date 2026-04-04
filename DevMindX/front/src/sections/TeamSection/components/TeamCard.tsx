export type TeamCardProps = {
    name: string;
    role: string;
    imageSrc: string;
    imageAlt: string;
    imageSizes?: string;
    imageClassName?: string;
};

export const TeamCard = (props: TeamCardProps) => {
    return (
        <div className="box-border gap-x-5 flex flex-col gap-y-5 md:gap-x-6 md:gap-y-6 group cursor-default">
            <div className="overflow-hidden rounded-xl">
                <img
                    src={props.imageSrc}
                    alt={props.imageAlt}
                    sizes={props.imageSizes}
                    className={`box-border max-w-full w-full transition-all duration-500 group-hover:grayscale group-hover:scale-95${props.imageClassName ? ` ${props.imageClassName}` : ""}`}
                />
            </div>
            <div className="items-center box-border gap-x-1 flex flex-col justify-center gap-y-1">
                <p className="text-zinc-900 text-[22px] font-medium box-border leading-[26.4px] text-center transition-colors duration-200 group-hover:text-indigo-600 md:text-2xl md:leading-[28.8px]">
                    {props.name}
                </p>
                <div className="text-zinc-900/60 box-border leading-[16.8px] text-center">
                    {props.role}
                </div>
            </div>
        </div>
    );
};
