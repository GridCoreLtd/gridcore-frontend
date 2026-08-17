import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Tailwind v4 ships a Vite plugin; it replaces the PostCSS pipeline and the
  // tailwind.config.cjs, both of which are gone.
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // .test.net domains are served by the local nginx (console.gridcore.test.net)
  server: { port: 3001, allowedHosts: [".test.net"] },
  preview: { port: 3001 },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
