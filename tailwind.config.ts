import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          300: "#5DF2C0",
          400: "#29E3A6",
          500: "#10D6A1",
        },
      },
      boxShadow: {
        neon: "0 10px 30px rgba(16,214,161,.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
