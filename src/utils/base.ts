/**
 * Centralized base-path helper for GitHub Pages deployments.
 *
 * Astro exposes the configured `base` via `import.meta.env.BASE_URL`, which
 * already has a leading slash and trailing slash (e.g. `/` or `/repo/`).
 *
 * IMPORTANT: Astro auto-prefixes `base` only for files in `/public` and for
 * routes it generates. It does NOT auto-prefix hand-written `href="/posts/"`
 * in components. Such links resolve to the domain root and 404 on project
 * Pages. Use `withBase()` for every internal link you write by hand.
 *
 *   withBase('/posts/')              // -> '/posts/' or '/repo/posts/'
 *   withBase(`/posts/${slug}/`)      // -> '/repo/posts/<slug>/'
 */
export const base: string =
  (import.meta.env.BASE_URL as string | undefined) ?? '/';

/**
 * Prefix a site-relative path with the configured base.
 *
 * - `/`           → `/` or `/repo/`
 * - `/posts/`     → `/posts/` or `/repo/posts/`
 * - `posts/foo/`  → also works (leading slash optional)
 *
 * Existing external URLs (http/https/mailto/#) are returned untouched.
 *
 * NOTE: Astro's `import.meta.env.BASE_URL` may or may not have a trailing
 * slash depending on how `base` is configured. We normalize both ends so
 * the result is always well-formed regardless of the input shape.
 */
export function withBase(path: string): string {
  // Don't touch external links, anchors, or mailto.
  if (/^(https?:|mailto:|tel:|#|data:)/i.test(path)) return path;

  // Normalize base: exactly one trailing slash, or just '/' for root.
  // Handles both '/' and '/repo' and '/repo/' inputs.
  const normalizedBase = base === '/' ? '/' : `${base.replace(/\/+$/, '')}/`;

  // Already prefixed? Avoid doubling up.
  if (normalizedBase !== '/' && (`${path}/`).startsWith(normalizedBase)) {
    return path;
  }

  // Strip leading slash(es) from the input path so concatenation is clean.
  const cleanPath = path.replace(/^\/+/, '');

  return `${normalizedBase}${cleanPath}`;
}


