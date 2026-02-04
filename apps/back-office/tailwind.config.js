/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#741617',
          cream: '#FEFCF0',
          olive: '#4C4A38',
        },
      },

      fontFamily: {
        display: ['Bondrians', 'serif'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
      },

      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero-mobile': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'tagline': ['1.25rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'tagline-mobile': ['1rem', { lineHeight: '1.5' }],
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      borderRadius: {
        'none': '0',
        'sm': '1px',
        'DEFAULT': '2px',
        'md': '3px',
        'lg': '4px',
      },

      transitionDuration: {
        'DEFAULT': '200ms',
      },

      minHeight: {
        'dvh': '100dvh',
      },

      height: {
        'dvh': '100dvh',
      },

      backgroundImage: {
        'gradient-overlay': 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
      },
    },
  },
  plugins: [],
}
