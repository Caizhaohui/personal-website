/**
 * rehype plugin: prefix internal URLs in rendered Markdown with the Astro base.
 *
 * Why this exists:
 *   Astro auto-prefixes the `base` config for routes it generates and for
 *   assets referenced in .astro components, but it does NOT rewrite URLs
 *   inside Markdown/MDX bodies. A `![](/images/foo.png)` in a `.md` file
 *   emits `<img src="/images/foo.png">` verbatim, which 404s when the site
 *   is deployed under a sub-path (e.g. GitHub Pages project sites).
 *
 * What it does:
 *   Walks the HAST tree and prefixes `src`/`href` on <img>/<a> (and video/
 *   source/link where relevant) when the value is site-relative (starts
 *   with `/`) and not already prefixed.
 *
 * Usage in astro.config.mjs:
 *   markdown: { rehypePlugins: [[rehypePrefixBase, { base }]] }
 *
 * The `base` option should be the Astro base (e.g. '/' or '/repo/').
 */
import type { Plugin } from 'unified';
import type { Element, Root } from 'hast';

export interface RehypePrefixBaseOptions {
  base: string;
}

const ATTRS_BY_TAG: Record<string, string[]> = {
  img: ['src'],
  a: ['href'],
  source: ['src', 'srcset'],
  video: ['src', 'poster'],
  audio: ['src'],
  track: ['src'],
  link: ['href'],
  image: ['href', 'xlink:href'], // SVG <image>
  use: ['href', 'xlink:href'],
};

function prefixUrl(url: string, base: string): string {
  if (!url) return url;
  // Skip external, protocol-relative, anchor, data URIs.
  if (/^(https?:|\/\/|mailto:|tel:|#|data:)/i.test(url)) return url;
  // Only prefix root-relative paths.
  if (!url.startsWith('/')) return url;
  if (base === '/') return url;
  const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}/`;
  // Avoid double-prefix.
  if (url.startsWith(normalizedBase)) return url;
  return `${normalizedBase}${url.replace(/^\/+/, '')}`;
}

// srcset looks like: "url1 1x, url2 2x" — prefix each URL candidate.
function prefixSrcset(value: string, base: string): string {
  return value
    .split(',')
    .map((part) => {
      const trimmed = part.trim();
      const [url, ...rest] = trimmed.split(/\s+/);
      return rest.length === 0 ? prefixUrl(url, base) : `${prefixUrl(url, base)} ${rest.join(' ')}`;
    })
    .join(', ');
}

export const rehypePrefixBase: Plugin<[RehypePrefixBaseOptions], Root> = (
  options,
) => {
  const base = options?.base ?? '/';
  return (tree) => {
    visit(tree as Element, base);
  };
};

/** Recursive DFS over the HAST tree. */
function visit(node: Element | Root, base: string): void {
  const children = (node as Element).children;
  if (Array.isArray(children)) {
    for (const child of children) {
      visit(child as Element, base);
    }
  }
  if (node.type !== 'element') return;
  const attrs = ATTRS_BY_TAG[node.tagName];
  if (!attrs) return;
  const props = node.properties;
  if (!props) return;
  for (const attr of attrs) {
    const value = props[attr];
    if (typeof value !== 'string') continue;
    if (attr === 'srcset') {
      props[attr] = prefixSrcset(value, base);
    } else {
      props[attr] = prefixUrl(value, base);
    }
  }
}

export default rehypePrefixBase;
