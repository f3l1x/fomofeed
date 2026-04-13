import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import alpinejs from "@astrojs/alpinejs";

export default defineConfig({
  outDir: "../public",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [alpinejs()],
});
