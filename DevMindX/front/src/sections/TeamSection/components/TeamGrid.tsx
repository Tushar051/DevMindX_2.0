import { TeamCard } from "@/sections/TeamSection/components/TeamCard";
import tusharImg from "@/assets/team/tushar.png";
import nutanImg from "@/assets/team/nutan.png";
import aayushImg from "@/assets/team/aayush.png";
import samarthImg from "@/assets/team/samarth.png";

const team = [
    {
        name: "Tushar Kedar",
        imageSrc: tusharImg,
        imageAlt: "creative-img-1",
        imageSizes: "(max-width: 600px) 100vw, 600px",
    },
    {
        name: "Nutan Satpute",
        imageSrc: nutanImg,
        imageAlt: "creative-img-2",
    },
    {
        name: "Aayush Jadhav",
        imageSrc: aayushImg,
        imageAlt: "creative-img-3",
    },
    {
        name: "Samarth Uttampalle",
        imageSrc: samarthImg,
        imageAlt: "creative-img-4",
        imageSizes: "(max-width: 600px) 100vw, 600px",
    },
];

export const TeamGrid = () => {
    return (
        <div className="box-border gap-x-8 grid auto-cols-[1fr] grid-cols-1 grid-rows-[auto] gap-y-8 mt-10 sm:grid-cols-2 md:gap-x-6 md:grid-cols-4 md:gap-y-6 md:mt-20">
            {team.map((member, i) => (
                <div
                    key={i}
                    style={{ transitionDelay: `${i * 80}ms` }}
                >
                    <TeamCard {...member} />
                </div>
            ))}
        </div>
    );
};
