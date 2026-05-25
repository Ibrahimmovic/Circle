export default {
  content: ['./client/**/*.{html,js,jsx}'],
  theme: {
    extend: {
      colors: {
        arc: { 50: '#f0f7ff', 100: '#e0effe', 200: '#b9dffd', 400: '#4fb3f6', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1' },
        regime: { bull: '#10b981', bear: '#f97316', crisis: '#ef4444', euphoria: '#f59e0b', neutral: '#6366f1' }
      }
    }
  },
  plugins: []
};
