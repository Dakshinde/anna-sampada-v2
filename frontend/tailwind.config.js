/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'dancing-leaf': 'dancing-leaf 20s ease-in-out infinite',
        'flowing-breeze': 'flowing-breeze 15s linear infinite',
      },
      keyframes: {
        'dancing-leaf': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '50%': { transform: 'translateY(50vh) rotate(45deg) translateX(40px)' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(90deg) translateX(-20px)', opacity: '0' },
        },
        'flowing-breeze': {
          '0%': { transform: 'translate(-10vw, -10vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translate(110vw, 110vh) rotate(360deg)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}