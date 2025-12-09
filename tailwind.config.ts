import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",      // 掃描 app 資料夾
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // 掃描 components 資料夾
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",      // 掃描 lib 資料夾
  ],
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite", // 背景光球動畫
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;