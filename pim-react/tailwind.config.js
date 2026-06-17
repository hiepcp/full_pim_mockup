/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Outfit', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          50:  '#E6F1FB',
          100: '#CCDFF7',
          400: '#378ADD',
          600: '#185FA5',
          800: '#0C447C',
        },
      },
      boxShadow: {
        card:  '0 1px 4px rgba(24,95,165,0.06)',
        hover: '0 4px 14px rgba(24,95,165,0.10)',
      },
    },
  },
  plugins: [],
}
