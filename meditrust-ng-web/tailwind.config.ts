import type { Config } from 'tailwindcss'
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          mint: "#98FF98",
          cyan: "#00CFC1",
          ink: "#0A0F0D",
          soft: "#111C18"
        }
      },
      borderRadius: { '2xl': '1.25rem' },
      boxShadow: { 'soft': '0 10px 30px rgba(0,207,193,0.12)' }
    }
  },
  plugins: []
}
export default config;
