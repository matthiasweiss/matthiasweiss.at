// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const site = import.meta.env.PROD
  ? "https://matthiasweiss.at"
  : "http://localhost:4321";

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        dark: "one-dark-pro",
        light: "one-light",
      },
      wrap: true,
    },
  },
});
