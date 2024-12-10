/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        colorBgBlack: '#080808',
        colorTextBlack: '#111111',
        colorBlue: '#0A7CFF',
        colorPurple: '#2A2737',
        colorGray: '#8E9297',
        colorPurpleText: '#A6AAB2',
        colorPurpleCard: 'rgba(182, 178, 255, 0.50)',
        colorBtnButton: 'rgba(241, 239, 255, 0.20)',
        colorBgButton: '#8C77ED',
        colorBgPopular: '#262689'
      },
      boxShadow: {
        'custom-inset-black': 'inset 0 0 30px 0 rgba(10, 124, 255, 0.8)',
        'custom-inset-blue': '0px 1.3444777727127075px 4.154436111450195px rgba(210, 208, 225, 0.07), 0px 3.2309670448303223px 9.983687400817871px rgba(210, 208, 225, 0.1), 0px 6.083624362945557px 18.798398971557617px rgba(210, 208, 225, 0.12), 0px 10.85214614868164px 33.53313064575195px rgba(210, 208, 225, 0.14), 0px 20.297746658325195px 62.720035552978516px rgba(210, 208, 225, 0.17)',

      },
    },
  },
  plugins: [],
}

