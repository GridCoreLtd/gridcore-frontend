import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Tailwind v4 ships a Vite plugin; it replaces the PostCSS pipeline and the
  // tailwind.config.cjs, both of which are gone.
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // Wildcard: every <merchant>.gridcore.test.net lands here via the local
  // nginx so per-merchant branding can key off the subdomain.
  server: { port: 3000, allowedHosts: [".test.net"] },
  preview: { port: 3000 },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
