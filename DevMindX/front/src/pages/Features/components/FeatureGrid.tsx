import { FeatureCard } from "./FeatureCard";
import { Sparkles, Code2, FolderKanban, Search, LayoutTemplate, GraduationCap } from "lucide-react";

/** Sticky stack offsets — only applied at `lg:` (see wrapper). Matches calc(8rem + i * 1.5rem). */
const STICKY_TOP_LG = [
    "lg:top-32",
    "lg:top-[9.5rem]",
    "lg:top-[11rem]",
    "lg:top-[12.5rem]",
    "lg:top-[14rem]",
    "lg:top-[15.5rem]",
] as const;

const STICKY_Z_LG = [
    "lg:z-0",
    "lg:z-10",
    "lg:z-20",
    "lg:z-30",
    "lg:z-40",
    "lg:z-50",
] as const;

export const FeatureGrid = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
    const features = [
        {
            title: "AI Project Generator",
            description: "Transform ideas into production-ready applications using advanced AI",
            icon: Sparkles,
            colorFrom: "from-[#b026ff]",
            colorTo: "to-[#ff1b6b]",
            buttonLabel: "Generate Project",
            bullets: ["Natural Language Processing", "Real-time Preview", "Multi-framework Support"],
            delay: "reveal-delay-1",
            to: "/app/generator",
        },
        {
            title: "AI IDE",
            description: "Production-grade IDE with Monaco Editor, Docker sandbox, and AI assistance",
            icon: Code2,
            colorFrom: "from-[#3b82f6]",
            colorTo: "to-[#06b6d4]",
            buttonLabel: "Open IDE",
            bullets: ["Monaco Editor", "Docker Sandbox", "AI Assistant"],
            delay: "reveal-delay-2",
            to: "/app/ide",
        },
        {
            title: "Project Management",
            description: "Centralized workspace for all your AI-generated projects",
            icon: FolderKanban,
            colorFrom: "from-[#10b981]",
            colorTo: "to-[#14b8a6]",
            buttonLabel: "View Projects",
            bullets: ["Quick Access", "Live Preview", "Version Control"],
            delay: "reveal-delay-3",
            to: "/app/projects",
        },
        {
            title: "Research Engine",
            description: "AI-powered research assistant for comprehensive information gathering",
            icon: Search,
            colorFrom: "from-[#f97316]",
            colorTo: "to-[#ef4444]",
            buttonLabel: "Start Research",
            bullets: ["Web Search", "AI Analysis", "Source Citations"],
            delay: "reveal-delay-1",
            to: "/app/research",
        },
        {
            title: "Architecture Generator",
            description: "Design system architectures with AI-powered recommendations",
            icon: LayoutTemplate,
            colorFrom: "from-[#d946ef]",
            colorTo: "to-[#ec4899]",
            buttonLabel: "Design Architecture",
            bullets: ["Visual Diagrams", "Best Practices", "Technology Stack"],
            delay: "reveal-delay-2",
            to: "/app/architecture",
        },
        {
            title: "Learning Mode",
            description: "Interactive tutorials and AI-guided learning experiences",
            icon: GraduationCap,
            colorFrom: "from-[#6366f1]",
            colorTo: "to-[#3b82f6]",
            buttonLabel: "Start Learning",
            bullets: ["Step-by-step Guides", "Interactive Exercises", "AI Tutor"],
            delay: "reveal-delay-3",
            to: "/app/learning",
        }
    ];

    return (
        <div className="flex flex-col gap-6 sm:gap-8 relative w-full mb-10">
            {features.map((feature, i) => (
                <div
                    key={i}
                    className={[
                        "w-full",
                        /* Below lg: normal flow — sticky stack overlaps and looks broken on narrow viewports */
                        "max-lg:relative max-lg:z-auto",
                        "lg:sticky",
                        STICKY_TOP_LG[i] ?? STICKY_TOP_LG[0],
                        STICKY_Z_LG[i] ?? STICKY_Z_LG[0],
                    ].join(" ")}
                >
                    <FeatureCard {...feature} isLoggedIn={isLoggedIn} />
                </div>
            ))}
        </div>
    );
};
