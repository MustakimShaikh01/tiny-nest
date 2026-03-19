/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
          pale: '#D8F3DC',
        },
        earth: {
          DEFAULT: '#8B5E3C',
          light: '#C8956C',
        },
        cream: {
          DEFAULT: '#FEFAE0',
          dark: '#F5EFC7',
        },
        charcoal: '#1A1A1A',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      borderRadius: {
        'tiny': '12px',
        'tiny-sm': '8px',
      },
      boxShadow: {
        'tiny': '0 4px 24px rgba(0,0,0,0.08)',
        'tiny-sm': '0 2px 8px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
