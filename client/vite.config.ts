import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"

export default defineConfig({
  root: "./client",
  plugins: [reactRefresh()],
  server: {
    host: "0.0.0.0",
  },
})
