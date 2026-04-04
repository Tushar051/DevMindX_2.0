import { useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CheckCircle2, ArrowRight } from "lucide-react";

type Props = {
    title: string;
    description: string;
    icon: React.ElementType;
    colorFrom: string;
    colorTo: string;
    buttonLabel: string;
    bullets: string[];
    delay: string;
    isLoggedIn: boolean;
    /** In-app route when authenticated (e.g. /app/generator) */
    to: string;
};

export const FeatureCard = ({ title, description, icon: Icon, colorFrom, colorTo, buttonLabel, bullets, delay, isLoggedIn, to }: Props) => {
    const ref = useScrollReveal<HTMLDivElement>();
    const navigate = useNavigate();

    const handleClick = () => {
        if (!isLoggedIn) {
            navigate("/login", { state: { from: to } });
        } else {
            navigate(to);
        }
    };

    return (
        <div 
            ref={ref} 
            className={`reveal ${delay} flex flex-col bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 card-hover group`}
        >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorFrom} ${colorTo} mb-6 shadow-md`}>
                <Icon className="text-white w-7 h-7" />
            </div>

            <h3 className="text-xl md:text-2xl font-semibold text-zinc-900 mb-3 tracking-wide">{title}</h3>
            
            <p className="text-zinc-600 text-sm leading-relaxed mb-6 min-h-[44px]">
                {description}
            </p>

            <ul className="mb-8 space-y-3 flex-1">
                {bullets.map((bullet, i) => (
                    <li key={i} className="flex items-center text-zinc-700 text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500 flex-shrink-0" />
                        {bullet}
                    </li>
                ))}
                <li className="text-zinc-400 text-xs pl-7 pt-1">+1 more features</li>
            </ul>

            <button 
                onClick={handleClick}
                className={`w-full flex items-center justify-center gap-x-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isLoggedIn 
                    ? `bg-gradient-to-r ${colorFrom} ${colorTo} text-white hover:opacity-90 shadow-md`
                    : "bg-zinc-100 text-zinc-500 cursor-pointer hover:bg-zinc-200"
                }`}
            >
                {isLoggedIn ? (
                    <>
                        {buttonLabel}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                ) : (
                    "🔒 Login to Access"
                )}
            </button>
        </div>
    );
};
