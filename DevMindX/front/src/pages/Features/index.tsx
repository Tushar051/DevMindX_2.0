import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FeatureGrid } from "@/pages/Features/components/FeatureGrid";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAuth } from "@/context/AuthContext";

export const Features = () => {
    const { isAuthenticated, logout } = useAuth();
    
    // Page Title Reveal Animation
    const headerRef = useScrollReveal<HTMLDivElement>();

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-transparent text-zinc-900 pt-32 pb-40 relative">
            {/* Background Gradient */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-[url('https://cdn.prod.website-files.com/69d01fffb4b1be95e3c63266/69d02000b4b1be95e3c63319_background-gradient.webp')] bg-cover bg-bottom opacity-50 pointer-events-none -z-10" />

            <div className="max-w-[1272px] mx-auto px-5 relative z-10">
                <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
                    
                    {/* Left Sticky Section */}
                    <div className="w-full lg:w-1/3 lg:sticky lg:top-32" ref={headerRef}>
                        <div className="reveal text-center lg:text-left mb-8">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-none">
                                DevMindX
                                <span className="block font-instrument_serif italic font-normal text-6xl md:text-8xl text-indigo-600 mt-2">
                                    Features
                                </span>
                            </h1>
                            <p className="text-zinc-600 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Unlock the full potential of your development workflow with powerful, AI-driven modular tools. Scroll through to see how we supercharge your IDE.
                            </p>
                        </div>

                        <div className="reveal reveal-delay-1 flex w-full max-w-[400px] flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mx-auto lg:mx-0 bg-white/80 p-3 rounded-2xl border border-zinc-200 shadow-sm backdrop-blur-md">
                            <span className="text-sm text-zinc-500 px-3 font-medium text-center sm:text-left">
                                {isAuthenticated ? "Signed in — open any feature below." : "Sign in to open tools in a full page."}
                            </span>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            to="/app/profile"
                                            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 text-center transition-all duration-300"
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => logout()}
                                            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-all duration-300"
                                        >
                                            Log out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            state={{ from: "/features" }}
                                            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 text-center"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 text-zinc-800 hover:bg-zinc-50 text-center"
                                        >
                                            Sign up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Scrolling Grid Section */}
                    <div className="w-full lg:w-2/3">
                        <FeatureGrid isLoggedIn={isAuthenticated} />
                    </div>

                </div>
            </div>
        </div>
    );
};
