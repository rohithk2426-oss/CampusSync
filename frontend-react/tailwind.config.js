/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: { 50: '#eef2ff', 100: '#e0e7ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
                accent: { DEFAULT: '#00bfa5', light: '#5df2d6' },
                dark: { DEFAULT: '#0f1724', card: '#1a2332', hover: '#1e293b', border: '#2d3748' }
            },
            fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
        }
    },
    plugins: []
};
