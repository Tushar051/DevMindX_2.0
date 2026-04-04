const logos = [
    { src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02450d9130ec20fd08f89_React.png", alt: "React" },
    { src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d024505b2bfcbbf6e14cff_Node.js.png", alt: "Node.js" },
    { src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02450fb1bc7bf17899b73_TypeScript.png", alt: "TypeScript" },
    { src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02450bdfc826da5584218_MongoDB.png", alt: "MongoDB" },
    { src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d024504ddd4c2a79829dfd_Socket.io.png", alt: "Socket.io" },
    { src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d024502b7cbb6e1e0dafb7_Docker.png", alt: "Docker" },
    { src: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02571c0be44f1833ff21b_AWS.png", alt: "AWS" },
];

export const TechMarquee = () => {
    const doubled = [...logos, ...logos];
    return (
        <div className="relative overflow-hidden mt-5 before:absolute before:left-0 before:top-0 before:h-full before:w-16 before:bg-gradient-to-r before:from-white before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:h-full after:w-16 after:bg-gradient-to-l after:from-white after:to-transparent after:z-10">
            <div className="flex gap-8 animate-marquee w-max">
                {doubled.map((logo, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-center w-[160px] h-20 flex-shrink-0 cursor-default"
                    >
                        <img
                            src={logo.src}
                            alt={logo.alt}
                            className="max-w-[140px] max-h-16 object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
