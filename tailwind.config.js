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
                primary: "#8B3A3A", // Vintage Maroon
                "background-light": "#F9F4EF", // Creamy Paper
                "background-dark": "#1C1917", // Warm Charcoal/Dark Brown
                "gold-accent": "#C5A065", // Matches the gold in the logo
                "text-light": "#5C2525",
                "text-dark": "#E6D5B8",
                "brand-gold": "#B8955F", // Specific logo gold
            },
            fontFamily: {
                display: ['"Playfair Display"', 'serif'],
                serif: ['"Noto Serif SC"', 'serif'],
            },
            borderRadius: {
                DEFAULT: "0.5rem",
            },
            backgroundImage: {
                'paper-texture': "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
            }
        },
    },
    plugins: [],
}
