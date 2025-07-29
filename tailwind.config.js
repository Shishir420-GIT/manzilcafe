/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Coffee Browns (existing)
        coffee: {
          dark: '#4A3428',
          darker: '#3A2820',
          medium: '#6B4E3D',
          light: '#8B6F4C',
        },
        // Cream & Beige Tones (existing)
        cream: {
          primary: '#F5E6D3',
          secondary: '#E8D5C4',
          tertiary: '#DBC4A9',
          bg: '#FDF8F0',
        },
        // Enhanced colors for new landing page
        'warm-beige': '#F5E6D3',
        'coffee-medium': '#8B7355',
        // Accent Colors (existing + enhanced)
        orange: {
          accent: '#D2691E',
        },
        golden: {
          accent: '#DAA520',
        },
        warm: {
          white: '#FAF7F2',
        },
        // Text Colors (existing)
        text: {
          primary: '#2C1810',
          secondary: '#5D4037',
          muted: '#8D6E63',
          inverse: '#FFFFFF',
        },
        // Status Colors (existing)
        success: '#8BC34A',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
        // shadcn/ui colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "bounce-gentle": {
          "0%, 100%": {
            transform: "translateY(0px)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(-8px)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-12px)",
          },
        },
        "steam": {
          "0%": {
            transform: "translateY(0px)",
            opacity: "0.7",
          },
          "100%": {
            transform: "translateY(-40px)",
            opacity: "0",
          },
        },
        "shimmer": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(210, 105, 30, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(210, 105, 30, 0.5)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "bounce-gentle": "bounce-gentle 3s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "steam": "steam 4s ease-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};