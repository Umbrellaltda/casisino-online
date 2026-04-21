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
        brand: {
          primary: '#DA0000',
          secondary: '#00DD70',
          tertiary: '#FAD749',
          surface: {
            background: '#FFFFFF',
            card: '#f4f3ed',
            'card-highlight': '#ff6767',
          },
          text: {
            default: '#000000',
            inverse: '#FFFFFF',
            highlight: '#ff6767',
            muted: '#555555',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        branded: ['NNSwintonSTD', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '3xs': '0.6rem',
        '2xs': '0.7rem',
        xs: '0.824rem',
        sm: '1rem',
        md: '1.294rem',
        lg: '1.471rem',
        xl: '1.765rem',
        '2xl': '2.059rem',
      },
      spacing: {
        quarck: '0.235rem',
        nano: '0.471rem',
        xs: '0.706rem',
        sm: '0.941rem',
        md: '1.412rem',
        bg: '1.882rem',
        xl: '2.353rem',
        '2xl': '2.824rem',
        '3xl': '3.765rem',
      },
      borderRadius: {
        xs: '0.176rem',
        sm: '0.353rem',
        md: '0.706rem',
        lg: '1.059rem',
        xl: '1.412rem',
        full: '9999px',
      },
      height: {
        navbar: '50px',
      },
      zIndex: {
        navbar: '50',
      },
    },
  },
  plugins: [],
}
