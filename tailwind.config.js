/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                // Custom colors if needed
            },
            animation: {
                'spin': 'spin 1s linear infinite',
            },
        },
    },
    plugins: [],
}