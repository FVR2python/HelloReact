module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },},
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        fadeOut: 'fadeOut 0.3s ease-in-out',
        fadeIn: 'fadeIn 0.3s ease-in-out',
        slideDown: 'slideDown 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
