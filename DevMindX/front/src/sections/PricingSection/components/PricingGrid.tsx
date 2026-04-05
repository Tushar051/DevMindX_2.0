import { useState } from "react";
import { PricingCard } from "@/sections/PricingSection/components/PricingCard";
import { useAuth } from "@/context/AuthContext";
import { apiUrl, authHeaders } from "@/lib/api";

const RAZORPAY_KEY = "rzp_test_SZwhEMDZZPwMLh";

const PLAN_TO_MODEL: Record<string, string> = {
    Basic: "gemini",
    Standard: "deepseek",
    Pro: "claude",
    Advance: "chatgpt",
};

export const PricingGrid = () => {
    const { isAuthenticated, user } = useAuth();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (planName: string, amount: number) => {
        if (!isAuthenticated) {
            alert("Please login first to subscribe to a plan.");
            return;
        }

        setLoadingPlan(planName);
        
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
            alert("Failed to load Razorpay SDK. Please check your connection.");
            setLoadingPlan(null);
            return;
        }

        const modelId = PLAN_TO_MODEL[planName];

        const options = {
            key: RAZORPAY_KEY,
            amount: amount, // Amount in paise
            currency: "INR",
            name: "DevMindX",
            description: `${planName} Plan Subscription`,
            image: "https://c.animaapp.com/mnjysuh44mDhUR/assets/69d02000b4b1be95e3c632fe_checked.svg",
            handler: async function (response: any) {
                // Payment successful on Razorpay side
                console.log("Payment Successful on Razorpay:", response);
                
                try {
                    // Sync with backend
                    const syncRes = await fetch(apiUrl("/api/ide/models/purchase"), {
                        method: "POST",
                        headers: {
                            ...authHeaders(),
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            modelId: modelId,
                            months: 1,
                            paymentMethod: "razorpay",
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            paymentDetails: {
                                planName: planName,
                                amount: amount / 100
                            }
                        })
                    });

                    if (syncRes.ok) {
                        localStorage.setItem("plan", planName);
                        alert(`Successfully subscribed to ${planName} plan! Your models are now unlocked in the AI IDE.`);
                    } else {
                        const err = await syncRes.json();
                        alert(`Payment recorded but failed to sync models: ${err.error || "Unknown error"}`);
                    }
                } catch (e) {
                    console.error("Sync error:", e);
                    alert("Payment successful but failed to connect to our servers to unlock your models. Please contact support.");
                } finally {
                    setLoadingPlan(null);
                }
            },
            prefill: {
                name: user?.username || "User Name",
                email: user?.email || "user@example.com",
                contact: "9999999999",
            },
            config: {
                display: {
                    blocks: {
                        upi: {
                            name: "Pay via UPI",
                            instruments: [
                                {
                                    method: "upi",
                                },
                            ],
                        },
                    },
                    sequence: ["block.upi", "block.cards", "block.netbanking"],
                    preferences: {
                        show_default_blocks: true,
                    },
                },
            },
            theme: {
                color: "#6366f1",
            },
            modal: {
                ondismiss: function() {
                    setLoadingPlan(null);
                }
            }
        };

        try {
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert("Payment failed: " + response.error.description);
                setLoadingPlan(null);
            });
            rzp.open();
        } catch (error) {
            console.error("Razorpay error:", error);
            alert("An error occurred while opening the payment gateway.");
            setLoadingPlan(null);
        }
    };

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
                    onClick={() => handlePayment("Basic", 74900)}
                    isLoading={loadingPlan === "Basic"}
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
                    onClick={() => handlePayment("Standard", 112500)}
                    isLoading={loadingPlan === "Standard"}
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
                    onClick={() => handlePayment("Pro", 129900)}
                    isLoading={loadingPlan === "Pro"}
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
                    onClick={() => handlePayment("Advance", 149900)}
                    isLoading={loadingPlan === "Advance"}
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
