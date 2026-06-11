/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Shared design tokens (§4.7) — slate-based dark UI matching v1.24L
        ink: '#0f172a',       // app background
        panel: '#1e293b',     // card background
        border: '#334155',
        muted: '#94a3b8',
        subtle: '#64748b',
        accent: '#06b6d4',    // cyan focus/interactive
        brand: '#E00000',     // CLI red
      },
    },
  },
  plugins: [],
};
