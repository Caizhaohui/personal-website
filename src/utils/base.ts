/**
 * Centralized base-path helper for GitHub Pages deployments.
 *
 * Astro exposes the configured `base` via `import.meta.env.BASE_URL`, which
 * already has a leading slash and trailing slash (e.g. `/` or `/repo/`).
 * Use `base` to prefix internal URLs so links work whether the site is
 * served from the domain root or a sub-path.
 *
 *   href={`${base}/posts/`}   // -> '/' or '/repo/'
 *
 * For `src`/`href` of assets in /public, Astro handles base automatically
 * when you use absolute paths starting with the configured base — but
 * string-concatenated routes need this prefix manually.
 */
export const base: string =
  (import.meta.env.BASE_URL as string | undefined) ?? '/';

/**
 * Join path segments onto the base, collapsing duplicate slashes.
 *   joinBase('/posts/', 'foo')  // -> '/posts/foo' (or '/repo/posts/foo')
 */
export function joinBase(...parts: string[]): string {
  const clean = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
  return `${base.replace(/\/+$/, '')}/${clean}`;
}
