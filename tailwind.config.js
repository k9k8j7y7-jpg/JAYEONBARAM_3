/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0A3D2E',
        'brand-secondary': '#F0F4F8',
        'brand-text': '#1A1A1A',
      },
      fontFamily: {
        serif: ["Noto Serif KR", "serif"],
        sans: ["Pretendard", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
