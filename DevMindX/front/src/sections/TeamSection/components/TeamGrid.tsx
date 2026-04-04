import { TeamCard } from "@/sections/TeamSection/components/TeamCard";

const team = [
    {
        name: "Tushar Kedar",
        role: "Wordpress Developer",
        imageSrc: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63344_creative_img_1.webp",
        imageAlt: "creative-img-1",
        imageSizes: "(max-width: 600px) 100vw, 600px",
    },
    {
        name: "Nutan Satpute",
        role: "Social Media Specialist",
        imageSrc: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632f9_profile2.png",
        imageAlt: "creative-img-2",
    },
    {
        name: "Aayush Jadhav",
        role: "Product Designer",
        imageSrc: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632f8_profile3.png",
        imageAlt: "creative-img-3",
    },
    {
        name: "Samarth Uttampalle",
        role: "UI Designer",
        imageSrc: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c63347_creative_img_4.webp",
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
