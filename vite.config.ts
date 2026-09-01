import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      // Exclude public/images from file watching to prevent EBUSY errors on Windows
      // when new restaurant images are copied in during development
      ignored: ['**/public/images/**'],
    },
  },
});

