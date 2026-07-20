// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { rehypePrefixBase } from './src/plugins/rehype-prefix-base';

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
    // Rewrite site-relative URLs in Markdown bodies (e.g. images, links) to
    // include the configured base. Without this, `![](/images/x.png)` in a
    // .md file 404s on project Pages sites.
    rehypePlugins: [[rehypePrefixBase, { base: SITE_BASE }]],
  },
  integrations: [
    mdx(),
    sitemap(),
  ],
});
