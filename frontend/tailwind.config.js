/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // You can customize your brand colors here if needed
        primary: '#2563eb', // blue-600
        secondary: '#4b5563', // gray-600
      }
    },
  },
  plugins: [],
}