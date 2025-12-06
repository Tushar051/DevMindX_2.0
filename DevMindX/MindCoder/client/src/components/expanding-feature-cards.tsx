import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Layers,
  MessageSquare,
  Sparkles,
  Code,
  FolderOpen,
} from "lucide-react";

interface FeatureCard {
  number: number;
  title: string;
  description: string;
  gradient: string;
  route: string;
  icon: React.ReactNode;
  features: string[];
}

interface Breakpoint {
  maxWidth: number;
  activeWidth: number;
  inactiveWidth: number;
  titleActive: string;
  titleInactive: string;
}

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  {
    maxWidth: 640,
    activeWidth: 280,
    inactiveWidth: 80,
    titleActive: "18px",
    titleInactive: "14px",
  },
  {
    maxWidth: 768,
    activeWidth: 350,
    inactiveWidth: 100,
    titleActive: "20px",
    titleInactive: "16px",
  },
  {
    maxWidth: 1024,
    activeWidth: 450,
    inactiveWidth: 120,
    titleActive: "24px",
    titleInactive: "18px",
  },
];

export function ExpandingFeatureCards() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cards: FeatureCard[] = [
    {
      number: 1,
      title: "Research Engine",
      description: "AI-powered research that analyzes your idea and generates the perfect project prompt with tech recommendations",
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      route: "/research",
      icon: <Brain className="w-12 h-12" />,
      features: ["Deep analysis", "Tech recommendations", "Best practices", "Ready prompts"],
    },
    {
      number: 2,
      title: "Architecture Generator",
      description: "Auto-generate system blueprints, class diagrams, ER diagrams, and comprehensive API documentation",
      gradient: "from-blue-500 via-cyan-500 to-blue-600",
      route: "/architecture",
      icon: <Layers className="w-12 h-12" />,
      features: ["System architecture", "Class diagrams", "ER diagrams", "API blueprints"],
    },
    {
      number: 3,
      title: "Learning Mode",
      description: "Understand every line of code with AI-powered explanations, interactive flow diagrams, and quiz questions",
      gradient: "from-orange-500 via-red-500 to-pink-500",
      route: "/learning-mode",
      icon: <MessageSquare className="w-12 h-12" />,
      features: ["Code explanations", "Flow diagrams", "Quiz questions", "Download materials"],
    },
    {
      number: 4,
      title: "Project Generator",
      description: "Describe your idea and watch AI create a complete, production-ready application in seconds",
      gradient: "from-purple-500 via-purple-600 to-pink-500",
      route: "/generator",
      icon: <Sparkles className="w-12 h-12" />,
      features: ["Natural language", "Live preview", "Production code", "Multiple frameworks"],
    },
    {
      number: 5,
      title: "Code Editor",
      description: "Professional IDE with AI assistance, integrated terminal, and real-time collaboration features",
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      route: "/ide",
      icon: <Code className="w-12 h-12" />,
      features: ["Monaco editor", "AI assistance", "Terminal", "Collaboration"],
    },
    {
      number: 6,
      title: "My Projects",
      description: "Manage all your projects in one place with quick access, live preview, and easy sharing",
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      route: "/projects",
      icon: <FolderOpen className="w-12 h-12" />,
      features: ["Quick access", "Live preview", "Easy sharing", "Version history"],
    },
  ];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { activeWidth, inactiveWidth, titleActive, titleInactive } =
    useMemo(() => {
      const sortedBreakpoints = [...DEFAULT_BREAKPOINTS].sort(
        (a, b) => a.maxWidth - b.maxWidth
      );
      let settings = {
        activeWidth: 500,
        inactiveWidth: 140,
        titleActive: "28px",
        titleInactive: "20px",
      };

      for (const bp of sortedBreakpoints) {
        if (windowWidth <= bp.maxWidth) {
          settings = {
            activeWidth: bp.activeWidth,
            inactiveWidth: bp.inactiveWidth,
            titleActive: bp.titleActive,
            titleInactive: bp.titleInactive,
          };
        }
      }
      return settings;
    }, [windowWidth]);

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const handlePrev = () => setActiveIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () =>
    setActiveIndex((prev) => Math.min(cards.length - 1, prev + 1));

  useEffect(() => {
    cardRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, [activeIndex]);

  return (
    <div className="relative group w-full py-8">
      <div
        ref={containerRef}
        className="flex overflow-x-auto w-full gap-3 md:gap-4 h-[400px] md:h-[450px] lg:h-[500px] px-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={`${card.title}-${index}`}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 snap-start shadow-2xl"
            animate={{
              width: activeIndex === index ? activeWidth : inactiveWidth,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onClick={() => handleCardClick(index)}
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />

            {/* Number badge */}
            <motion.div
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white font-bold text-lg z-10"
              animate={{
                scale: activeIndex === index ? 1.1 : 1,
              }}
            >
              {card.number}
            </motion.div>

            {/* Icon - visible when inactive */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80"
              animate={{
                opacity: activeIndex === index ? 0 : 1,
                scale: activeIndex === index ? 0.5 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {card.icon}
            </motion.div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
              <motion.h3
                animate={{
                  fontSize: activeIndex === index ? titleActive : titleInactive,
                  opacity: activeIndex === index ? 1 : 0.9,
                }}
                className="font-bold mb-2"
              >
                {card.title}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0,
                  y: activeIndex === index ? 0 : 20,
                  height: activeIndex === index ? "auto" : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm md:text-base mb-4 text-white/90">
                  {card.description}
                </p>

                {/* Features list */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {card.features.map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-1 text-xs text-white/80"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Action button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate(card.route);
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg px-4 py-2 text-white font-semibold text-sm transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore {card.title} →
                </motion.button>
              </motion.div>
            </div>

            {/* Vertical title for inactive cards */}
            <motion.div
              className="absolute left-1/2 bottom-6 -translate-x-1/2 origin-center"
              animate={{
                opacity: activeIndex === index ? 0 : 1,
                rotate: activeIndex === index ? 0 : -90,
              }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-white font-semibold text-sm whitespace-nowrap">
                {card.title}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="absolute inset-0 pointer-events-none">
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={`absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-3 transition-all pointer-events-auto ${
            activeIndex === 0 ? "opacity-0 cursor-default" : "opacity-100"
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        <button
          onClick={handleNext}
          disabled={activeIndex === cards.length - 1}
          className={`absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-3 transition-all pointer-events-auto ${
            activeIndex === cards.length - 1
              ? "opacity-0 cursor-default"
              : "opacity-100"
          }`}
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all ${
              activeIndex === index
                ? "w-8 bg-purple-500"
                : "w-2 bg-gray-400 hover:bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
