/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#B8955F", // Brand Gold
                "background-dark": "#1A1412", // Deep Chocolate/Black
                "gold-accent": "#C5A065", 
                "text-gold": "#E6D5B8",
                "border-gold": "rgba(184, 149, 95, 0.3)",
            },
            fontFamily: {
                display: ['"Playfair Display"', 'serif'],
                serif: ['"Noto Serif SC"', 'serif'],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
            },
            backgroundImage: {
                'sunray': "radial-gradient(circle at 50% 120%, #2A1D18 0%, #1A1412 70%)",
            }
        },
    },
    plugins: [],
}
