import { PricingCard } from "@/sections/PricingSection/components/PricingCard";

export const PricingGrid = () => {
    return (
        <div className="bg-transparent mt-10 md:mt-16 w-full max-w-[1400px] mx-auto overflow-hidden">
            <div className="flex xl:grid xl:grid-cols-5 gap-6 overflow-x-auto snap-x snap-mandatory pt-4 pb-8 px-5 lg:px-0 scrollbar-hide">
                <PricingCard
                    planName="Starter"
                    description="Perfect for trying out DevMindX"
                    price="Free"
                    buttonText="Get Started Free"
                    buttonTo="/app/ide"
                    features={[
                        "Together AI",
                        "10,000 tokens/month",
                        "Code Generation",
                        "Debugging",
                    ]}
                />
                <PricingCard
                    planName="Basic"
                    description="Best for solo developers"
                    price="₹749"
                    buttonText="Subscribe & pay"
                    buttonTo="/app/checkout/model/gemini"
                    features={[
                        "Google Gemini AI",
                        "50,000 tokens/month",
                        "Code Generation",
                        "Image Analysis",
                    ]}
                />
                <PricingCard
                    planName="Standard"
                    description="Great for freelancers & students"
                    price="₹1,125"
                    buttonText="Subscribe & pay"
                    buttonTo="/app/checkout/model/deepseek"
                    features={[
                        "DeepSeek AI",
                        "50,000 tokens/month",
                        "Debugging & Optimization",
                        "Architecture Design",
                    ]}
                />
                <PricingCard
                    planName="Pro"
                    description="Perfect for serious developers"
                    price="₹1,299"
                    buttonText="Subscribe & pay"
                    buttonTo="/app/checkout/model/claude"
                    highlighted={true}
                    features={[
                        "Claude AI",
                        "100,000 tokens/month",
                        "Long Context",
                        "Advanced Reasoning",
                    ]}
                />
                <PricingCard
                    planName="Advance"
                    description="OpenAI's powerful language model"
                    price="₹1499"
                    buttonText="Subscribe & pay"
                    buttonTo="/app/checkout/model/chatgpt"
                    features={[
                        "100,000 tokens",
                        "Natural Language",
                        "Code Completion",
                        "Problem Solving",
                        "Explanation",
                        "Debugging"
                    ]}
                />
            </div>
        </div>
    );
};
