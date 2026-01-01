/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4299e1', // bleu clair
          DEFAULT: '#3182ce', // bleu
          dark: '#2c5282', // bleu foncé
        },
      },
    },
  },
  plugins: [],
};
