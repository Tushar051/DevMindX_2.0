module.exports = {
    content: [
        "./src/**/*.{html,js,ts,jsx,tsx}",
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: [
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                    '"Apple Color Emoji"',
                    '"Segoe UI Emoji"',
                    '"Segoe UI Symbol"',
                    '"Noto Color Emoji"',
                ],
                "instrument_serif": ["Instrument Serif", "ui-sans-serif", "system-ui", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
                "inter_tight": ["Inter Tight", "ui-sans-serif", "system-ui", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"]
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                marquee: {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-50%)" },
                },
                "fade-in-up": {
                    from: { opacity: "0", transform: "translateY(24px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in": {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                "slide-in-right": {
                    from: { opacity: "0", transform: "translateX(100%)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                "slide-out-right": {
                    from: { opacity: "1", transform: "translateX(0)" },
                    to: { opacity: "0", transform: "translateX(100%)" },
                },
                "text-reveal": {
                    from: { color: "rgba(0,0,0,0.15)" },
                    to: { color: "rgb(24,24,27)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-6px)" },
                },
                "pulse-ring": {
                    "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(99,102,241,0.4)" },
                    "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(99,102,241,0)" },
                    "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(99,102,241,0)" },
                },
                "shimmer": {
                    "0%": { backgroundPosition: "-200% center" },
                    "100%": { backgroundPosition: "200% center" },
                },
                "count-up": {
                    from: { opacity: "0", transform: "translateY(12px) scale(0.95)" },
                    to: { opacity: "1", transform: "translateY(0) scale(1)" },
                },
                "slide-up-fade": {
                    from: { opacity: "0", transform: "translateY(16px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "reveal-from-left": {
                    from: { opacity: "0", transform: "translateX(-20px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                "reveal-from-right": {
                    from: { opacity: "0", transform: "translateX(20px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                "scale-in": {
                    from: { opacity: "0", transform: "scale(0.94)" },
                    to: { opacity: "1", transform: "scale(1)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                marquee: "marquee 30s linear infinite",
                "fade-in-up": "fade-in-up 0.7s ease-out forwards",
                "fade-in": "fade-in 0.6s ease-out forwards",
                "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
                "slide-out-right": "slide-out-right 0.3s ease-in forwards",
                "text-reveal": "text-reveal 1s ease-out forwards",
                "float": "float 3s ease-in-out infinite",
                "pulse-ring": "pulse-ring 2s ease-out infinite",
                "shimmer": "shimmer 2.5s linear infinite",
                "count-up": "count-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
                "slide-up-fade": "slide-up-fade 0.55s cubic-bezier(0.16,1,0.3,1) forwards",
                "reveal-from-left": "reveal-from-left 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
                "reveal-from-right": "reveal-from-right 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
                "scale-in": "scale-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
            },
        },
        container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    },
    plugins: [],
    darkMode: ["class"],
};
