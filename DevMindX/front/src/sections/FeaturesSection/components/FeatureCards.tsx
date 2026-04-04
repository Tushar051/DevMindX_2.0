import { Link } from "react-router-dom";

const cards = [
    {
        bg: "bg-purple-400/20",
        icon: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632ec_brand.svg",
        label: "AI Code Generation",
        hover: "hover:bg-purple-400/30",
        to: "/app/generator",
    },
    {
        bg: "bg-rose-400/20",
        icon: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6330a_webdevp.svg",
        label: "Integrated AI IDE",
        hover: "hover:bg-rose-400/30",
        to: "/app/ide",
    },
    {
        bg: "bg-blue-400/20",
        icon: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63336_digitalmarketing.svg",
        label: "Architecture Diagram Generator",
        hover: "hover:bg-blue-400/30",
        to: "/app/architecture",
    },
    {
        bg: "bg-orange-300/20",
        icon: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63358_uiux.svg",
        label: "Research Engine",
        hover: "hover:bg-orange-300/30",
        to: "/app/research",
    },
    {
        bg: "bg-green-400/20",
        icon: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c6337e_analitics.svg",
        label: "Learning Mode",
        hover: "hover:bg-green-400/30",
        to: "/app/learning",
    },
    {
        bg: "bg-teal-400/20",
        icon: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63336_digitalmarketing.svg",
        label: "Project management",
        hover: "hover:bg-teal-400/30",
        to: "/app/projects",
    },
];

export const FeatureCards = () => {
    return (
        <div className="box-border">
            <div
                role="list"
                className="items-stretch box-border gap-[18px] grid auto-cols-[1fr] grid-cols-1 grid-rows-[auto] justify-start mt-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 md:gap-6 md:mt-16"
            >
                {cards.map((card, i) => (
                    <li key={i} className="list-none">
                        <Link
                            to={card.to}
                            className={`items-stretch ${card.bg} ${card.hover} box-border gap-x-8 flex flex-col justify-between gap-y-8 p-8 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 no-underline text-inherit h-full`}
                        >
                            <img
                                src={card.icon}
                                alt=""
                                className="aspect-square box-border h-10 max-w-full w-10"
                            />
                            <p className="text-xl font-medium box-border leading-6 max-w-[140px]">
                                {card.label}
                            </p>
                        </Link>
                    </li>
                ))}
            </div>
        </div>
    );
};
