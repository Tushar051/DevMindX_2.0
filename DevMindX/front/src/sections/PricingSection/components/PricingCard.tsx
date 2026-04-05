import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export type PricingCardProps = {
    planName: string;
    description: React.ReactNode;
    price: string;
    buttonText: string;
    /** In-app route (e.g. checkout or IDE). Takes precedence over `buttonHref`. */
    buttonTo?: string;
    /** Plain href when not using `buttonTo`. */
    buttonHref?: string;
    features: string[];
    highlighted?: boolean;
    onClick?: () => void;
    isLoading?: boolean;
};

const actionClassName =
    "w-full relative overflow-hidden text-zinc-900 text-sm font-semibold items-center bg-white flex justify-center gap-x-2 py-3.5 border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:shadow-sm active:scale-95 transition-all duration-300 group cursor-pointer mt-auto disabled:opacity-70 disabled:cursor-not-allowed";

export const PricingCard = (props: PricingCardProps) => {
    const { onClick, isLoading, buttonTo, buttonHref, buttonText, planName, description, price, features } = props;

    const renderButtonContent = () => (
        <>
            <div className="relative z-10">
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                    </div>
                ) : (
                    buttonText
                )}
            </div>
            {!isLoading && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 relative z-10 transition-transform duration-300 group-hover:rotate-45">
                    <img
                        src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632e0_arrow-top-right-dark.svg"
                        alt=""
                        className="w-2"
                    />
                </div>
            )}
        </>
    );

    return (
        <div className="relative flex flex-col justify-between p-4 xl:p-5 rounded-2xl min-w-[220px] transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-default bg-white border border-zinc-200 snap-center shrink-0">
            {/* Top Section */}
            <div className="flex flex-col">
                <div className="inline-flex self-start text-white text-sm font-semibold tracking-wide bg-zinc-900 px-4 py-1.5 rounded-full mb-4">
                    {planName}
                </div>
                
                <div className="text-zinc-500 text-sm mb-6 min-h-[40px]">
                    {description}
                </div>
                
                <h3 className="text-zinc-900 text-3xl xl:text-4xl font-bold mb-4">
                    {price}
                </h3>

                <div className="text-zinc-900 font-semibold text-sm mb-3">Features</div>
                
                <ul className="flex flex-col gap-y-2.5 mb-6">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-x-3 text-sm text-zinc-700">
                            <img
                                src="https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632fe_checked.svg"
                                alt="check"
                                className="w-4 h-4 mt-0.5 flex-shrink-0"
                            />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Bottom Section (Action) */}
            {onClick ? (
                <button 
                    onClick={onClick} 
                    disabled={isLoading}
                    className={actionClassName}
                >
                    {renderButtonContent()}
                </button>
            ) : buttonTo ? (
                <Link to={buttonTo} className={actionClassName}>
                    {renderButtonContent()}
                </Link>
            ) : (
                <a href={buttonHref ?? "#"} className={actionClassName}>
                    {renderButtonContent()}
                </a>
            )}
        </div>
    );
};
