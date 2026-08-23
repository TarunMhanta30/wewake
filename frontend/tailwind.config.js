/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        mist: 'var(--mist)',
        'mist-2': 'var(--mist-2)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        'navy-2': 'var(--navy-2)',
        slate: 'var(--slate)',
        alarm: 'var(--alarm)',
        amber: 'var(--amber)',
        'amber-dk': 'var(--amber-dk)',
        orange: 'var(--orange)',
        'dim': 'var(--dim)',
        'track': 'var(--track)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { shell: '1240px' },
    },
  },
  plugins: [],
}
