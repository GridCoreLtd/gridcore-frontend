import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_WEBSITE_URL ?? "https://paygodash.com",
  // Fully static: the marketing site needs no Node runtime anywhere.
  output: "static",
  integrations: [
    // The React components are pre-rendered to HTML at build time and ship
    // ZERO JavaScript unless a `client:` directive asks for hydration.
    react(),
    sitemap(),
  ],
  server: { port: 3002 },
  vite: {
    // @astrojs/tailwind is deprecated for v4; the Tailwind Vite plugin is the
    // supported path and needs no integration wrapper.
    plugins: [tailwindcss()],
    // gridcore.test.net is served by the local nginx in front of this port.
    server: { allowedHosts: [".test.net"] },
  },
});
