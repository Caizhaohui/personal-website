// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// GitHub Pages base path handling:
//   - username.github.io repo  → base '/'
//   - project repo             → base '/repo-name/'
// Injected via env in CI; local dev defaults to '/'.
const SITE_URL = process.env.SITE_URL ?? 'https://example.github.io';
const SITE_BASE = process.env.SITE_BASE ?? '/';

// biome-ignore lint/suspicious/noConsole: log build config once for visibility
console.info(`[astro config] site=${SITE_URL} base=${SITE_BASE || "''"}`);

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: SITE_BASE,
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
  integrations: [
    mdx(),
    sitemap(),
  ],
});
