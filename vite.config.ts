import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Use relative base so it works on GitHub Pages (project sites) and locally.
export default defineConfig({
  plugins: [react()],
  base: '/Vayumetrics-pitch-deck/',
});
