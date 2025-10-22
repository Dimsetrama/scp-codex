/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Add ALL the color classes used in ContainmentStatusBar
  safelist: [
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-600',
    'bg-red-900',
    'bg-black',
    'bg-gray-200',
    'bg-gray-500',
    'text-white',
    'text-gray',
    'text-black',
    'animate-pulse',  // Add this too since it's used conditionally
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};