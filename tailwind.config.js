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
        colorBgPopular: '#262689',
        colorSimulador: '#0D1927',
        colorInput: '#201F21',
        colorBgClaro: '#E1DCFB',
        colorInputClaro: '#EDEBF5',
        colorBorder: '#0F161F',
        colorCeleste: '#0D7AF8',
        colorCelesteligth: '#58D8E3',
        colorblueblack: '#02264F',

        bgf3: '#ECEAF3',
        bgDashboardDark: '#201F21',
        bgDashboardLigth: '#FDFDFF',
        bghoverligth: '#F6F6F6',

        bgCardLigth: '#FDFDFD',

        colorGraydark: '#ADADAD',
        colorGraySecundary: '#D1D1D1',
        colorfila: '#12223C',
        colorGray2: '#6D6D6D'
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(180deg, rgba(240, 237, 251, 0.00) 0%, #E1DCFB 100%)', // Light gradient
        'custom-gradient-dark': 'linear-gradient(180deg, #111112 0%, #292636 100%)', // Dark gradient
        'custom-gradient-blue': 'linear-gradient(90deg, #58D8E3 0%, #02264F 100%)', // New gradient
        'custom-gradient-dash-dark': 'linear-gradient(181deg, #111 18.01%, #322E44 127.75%)',
        'custom-gradient-dash-ligth': 'linear-gradient(180deg, rgba(240, 237, 251, 0.00) 0%, #E1DCFB 100%)',
      },
      boxShadow: {
        'custom-inset-black': 'inset 0 0 30px 0 rgba(10, 124, 255, 0.8)',
        'custom-inset-blue': '0px 1.344px 4.154px rgba(210, 208, 225, 0.07), 0px 3.23px 9.98px rgba(210, 208, 225, 0.1), 0px 6.08px 18.8px rgba(210, 208, 225, 0.12), 0px 10.85px 33.53px rgba(210, 208, 225, 0.14), 0px 20.3px 62.72px rgba(210, 208, 225, 0.17)',
        'custom-purple': '0px 4px 10px 0px rgba(140, 119, 237, 0.30)', // New box shadow
      },
    },
  },
  plugins: [],
};
