/* eslint-disable @typescript-eslint/no-require-imports */
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8f1',
          100: '#ffe3d0',
          200: '#ffc7a1',
          300: '#ffa56d',
          400: '#ff8b45',
          500: '#ff7422',
          600: '#e05f16',
          700: '#b74811',
          800: '#8c350c',
          900: '#5e2205',
        },
        leaf: {
          50: '#f0f9f6',
          100: '#d9efe6',
          200: '#b4ddcd',
          300: '#89c7b0',
          400: '#5da789',
          500: '#2f8a64',
          600: '#206c4c',
          700: '#17543c',
          800: '#0f3b2c',
          900: '#07231b',
        },
        berry: {
          50: '#fff0f5',
          100: '#ffd6e6',
          200: '#ffabc8',
          300: '#ff80aa',
          400: '#ff5a8f',
          500: '#eb3b74',
          600: '#c3265c',
          700: '#961a46',
          800: '#6a1131',
          900: '#42091f',
        },
        sand: {
          50: '#f9f6ee',
          100: '#f1ead7',
          200: '#e4d3ae',
          300: '#d8ba83',
          400: '#cfa565',
          500: '#b8864b',
          600: '#94683a',
          700: '#75502c',
          800: '#53381d',
          900: '#33210f',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
