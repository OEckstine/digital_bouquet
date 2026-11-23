import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes the build work on gh-pages under /your-repo-name/
export default defineConfig({
  plugins: [react()],
  base: "./",
});
