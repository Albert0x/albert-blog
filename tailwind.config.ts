import type { Config } from "tailwindcss";

// 老王说明：博客主题配置
// 主渐变色：indigo -> violet -> cyan，活泼科技感
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        // 品牌色：用于按钮、强调元素
        brand: {
          DEFAULT: "#6366F1", // indigo-500
          light: "#8B5CF6",   // violet-500
          accent: "#06B6D4",  // cyan-500
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #06B6D4 100%)",
        "gradient-brand-soft": "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.10), rgba(6,182,212,0.12))",
      },
      animation: {
        "float-slow": "float 8s ease-in-out infinite",
        "gradient-shift": "gradient-shift 12s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
