/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Color Palette
        'frozen-lake': '#6ccff6',
        'ink-black': '#001011',
        'grey': '#757780',
        'porcelain': '#fffffc',
        'yellow-green': '#98ce00',
        
        // Semantic color names for easier usage
        'primary': '#6ccff6',        // Frozen Lake
        'primary-dark': '#4ab8e0',   // Darker frozen lake
        'dark': '#001011',           // Ink Black
        'text-secondary': '#757780',  // Grey
        'background': '#fffffc',     // Porcelain
        'accent': '#98ce00',         // Yellow Green
        'accent-dark': '#7ab300',    // Darker yellow-green
        
        // Legacy Portugal colors (keeping for backwards compatibility)
        'portugal-green': '#2d7f3e',
        'portugal-dark-green': '#1a5c2a',
        'portugal-gold': '#ffd700',
        'portugal-dark-gold': '#ffaa00',
      },
      fontFamily: {
        // San Francisco Font System
        'sf': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'sf-display': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'sf-text': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // Legacy support
        'sf-pro': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'sf-pro-display': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'sf-pro-text': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        'sf-tight': '-0.02em',
        'sf-tighter': '-0.05em',
        'sf-normal': '-0.01em',
      },
      lineHeight: {
        'sf-tight': '1.1',
        'sf-snug': '1.2',
        'sf-normal': '1.5',
        'sf-relaxed': '1.625',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slideUp': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'scaleIn': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      fontSize: {
        // SF Pro optimized sizes
        'sf-xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'sf-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'sf-base': ['1rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'sf-lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'sf-xl': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        'sf-2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        'sf-3xl': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        'sf-4xl': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'sf-5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        'sf-6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'sf-7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
        'sf-8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em' }],
        'sf-9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.06em' }],
      },
    },
  },
  plugins: [],
}
