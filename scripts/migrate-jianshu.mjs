// @ts-check
/**
 * Migrate Jianshu (简书) articles to Astro Markdown content.
 *
 * Flow:
 *   1. Fetch the user homepage, parse the article list (links to /p/<slug>).
 *   2. For each article, fetch its HTML, extract title / description / pubDate
 *      from <meta> + embedded JSON, and the body from <article>.
 *   3. Download images to public/images/posts/<slug>/ and rewrite URLs.
 *   4. Convert body HTML → Markdown via turndown (+ GFM plugin).
 *   5. Write src/content/blog/<slug>.md with frontmatter.
 *
 * Usage:
 *   pnpm migrate:jianshu                              # full run
 *   pnpm migrate:jianshu -- --dry-run                 # list only, no writes
 *   pnpm migrate:jianshu -- --user <id>               # override user
 *   pnpm migrate:jianshu -- --only <slug> [<slug>...] # specific articles
 *   pnpm migrate:jianshu -- --force                   # overwrite existing
 *
 * Robustness:
 *   - Skips already-migrated slugs unless --force.
 *   - Random delay between requests to be polite.
 *   - Retries failed fetches a few times.
 *   - If image download fails, falls back to the original Jianshu URL + warning.
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import * as turndownPluginGfm from 'turndown-plugin-gfm';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// --------------------------------------------------------------------------
// Config
// --------------------------------------------------------------------------

const DEFAULT_USER = '36f606498ed2';
const JIANSHU_BASE = 'https://www.jianshu.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const POSTS_DIR = join(ROOT, 'src', 'content', 'blog');
const IMAGES_DIR = join(ROOT, 'public', 'images', 'posts');

const MIN_DELAY_MS = 800;
const MAX_DELAY_MS = 2200;
const MAX_RETRIES = 3;

// --------------------------------------------------------------------------
// CLI parsing
// --------------------------------------------------------------------------

/** @typedef {{ dryRun: boolean, user: string, only: string[]|null, force: boolean }} CliArgs */

/** @returns {CliArgs} */
function parseArgs() {
  const argv = process.argv.slice(2);
  const args = { dryRun: false, user: DEFAULT_USER, only: null, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--user') args.user = argv[++i];
    else if (a === '--only') args.only = argv[++i]?.split(',').filter(Boolean) ?? null;
    else if (!a.startsWith('--')) {
      // bare slug arg
      args.only = [...(args.only ?? []), a];
    }
  }
  return args;
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Random polite delay between requests. */
async function politeDelay() {
  await sleep(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

/**
 * GET with retries. Throws after MAX_RETRIES failures.
 * @param {string} url
 * @param {object} [extraHeaders]
 */
async function fetchWithRetry(url, extraHeaders) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await axios.get(url, {
        headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml', ...extraHeaders },
        timeout: 25000,
        validateStatus: (s) => s < 400,
      });
      return res;
    } catch (err) {
      lastErr = err;
      const status = /** @type {any} */ (err).response?.status;
      // Hard 404 / 403 won't get better with retries.
      if (status === 404) throw err;
      console.warn(`  ! attempt ${attempt} failed (${status ?? err.message}), retrying…`);
      await sleep(1500 * attempt);
    }
  }
  throw lastErr;
}

/** Convert a Unix-seconds or ms timestamp to an ISO date string. */
function tsToDate(ts) {
  const n = Number(ts);
  if (!n) return undefined;
  const d = new Date(n < 1e12 ? n * 1000 : n);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Generate a safe slug-safe filename from a Jianshu image URL. */
function imageFilenameFromUrl(url, idx) {
  const u = new URL(url);
  const base = u.pathname.split('/').pop() || `image-${idx}`;
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// --------------------------------------------------------------------------
// Fetch article list via Jianshu's internal JSON API
// --------------------------------------------------------------------------
//
// `GET /asimov/users/slug/<userId>/public_notes` returns an array (serialized
// as a numeric-keyed object) of { object: { data: { title, slug,
// first_shared_at, public_abbr, list_image_url } } }. This is more stable
// than scraping the homepage HTML, which rate-limits and SSR-flashes.

/**
 * @param {string} userId
 * @returns {Promise<{ slug: string, title: string, date: string }[]>}
 */
async function getArticleList(userId) {
  const url = `${JIANSHU_BASE}/asimov/users/slug/${userId}/public_notes`;
  console.info(`▶ Fetching article list from ${url}`);
  const res = await fetchWithRetry(url, {
    Referer: `${JIANSHU_BASE}/u/${userId}`,
    Accept: 'application/json',
  });
  const arr = Array.isArray(res.data) ? res.data : Object.values(res.data);
  /** @type {{slug:string,title:string,date:string}[]} */
  const list = [];
  for (const item of arr) {
    const note = item?.object?.data ?? item?.data ?? item;
    if (!note?.slug) continue;
    list.push({
      slug: note.slug,
      title: note.title ?? '',
      date: note.first_shared_at ?? '',
    });
  }
  console.info(`  found ${list.length} articles`);
  return list;
}

// --------------------------------------------------------------------------
// Fetch article via Jianshu's internal JSON API
// --------------------------------------------------------------------------
//
// The public /p/<slug> page renders body HTML client-side, so plain HTTP fetch
// returns an empty shell. The undocumented `/asimov/p/<slug>` endpoint returns
// the full article as JSON with `free_content` (body HTML), `public_title`,
// `description`, and `first_shared_at`. This is far more reliable than
// scraping the SSR page.

/**
 * @param {string} slug
 * @returns {Promise<{ title: string, description: string|undefined, pubDate: Date|undefined, bodyHtml: string }>}
 */
async function getArticle(slug) {
  const url = `${JIANSHU_BASE}/asimov/p/${slug}`;
  const res = await fetchWithRetry(url, {
    Referer: `${JIANSHU_BASE}/p/${slug}`,
    Accept: 'application/json',
  });
  const d = res.data;

  const title = (d.public_title || d.title || slug).trim();
  const description = d.description?.trim() || undefined;
  const pubDate = d.first_shared_at
    ? new Date(d.first_shared_at)
    : d.created_at
      ? tsToDate(d.created_at)
      : new Date();
  const bodyHtml = d.free_content || d.content || '';

  return { title, description, pubDate, bodyHtml };
}

// --------------------------------------------------------------------------
// Image localization
// --------------------------------------------------------------------------

/**
 * Download all Jianshu images referenced in the HTML to disk, rewrite the HTML
 * to point at the local relative path. Returns the rewritten HTML.
 *
 * Local path convention: /images/posts/<slug>/<filename>
 * In Markdown we reference them as /images/posts/<slug>/<filename> (absolute
 * from the site root, which works for Astro with any base path).
 *
 * @param {string} html
 * @param {string} slug
 * @param {boolean} dryRun
 */
async function localizeImages(html, slug, dryRun) {
  const $ = cheerio.load(`<div id="root">${html}</div>`);
  const imgs = $('#root img').toArray();

  if (imgs.length === 0) return html;

  const targetDir = join(IMAGES_DIR, slug);
  if (!dryRun) await mkdir(targetDir, { recursive: true });

  let downloaded = 0;
  let failed = 0;

  for (let i = 0; i < imgs.length; i++) {
    const el = imgs[i];
    let src = $(el).attr('src') || $(el).attr('data-original-src') || '';
    if (!src) continue;
    if (src.startsWith('//')) src = `https:${src}`;
    if (!src.startsWith('http')) continue;
    // Only localize Jianshu-hosted images; leave external ones alone.
    if (!src.includes('upload-images.jianshu.io') && !src.includes('jianshu.io')) {
      continue;
    }

    const filename = imageFilenameFromUrl(src, i);
    const relPath = `/images/posts/${slug}/${filename}`;

    if (dryRun) {
      console.info(`    [dry-run] would download ${src.slice(0, 60)}… → ${relPath}`);
      $(el).attr('src', relPath);
      continue;
    }

    try {
      const imgRes = await fetchWithRetry(src, { Referer: JIANSHU_BASE });
      await writeFile(join(targetDir, filename), imgRes.data);
      $(el).attr('src', relPath);
      // Drop srcset / data-* attributes that point to the CDN.
      $(el).removeAttr('srcset data-original-src');
      downloaded++;
    } catch (err) {
      console.warn(`    ! image download failed (${src.slice(0, 60)}…): ${/** @type {any} */ (err).message}`);
      // Keep the original absolute URL so the article still renders.
      $(el).attr('src', src);
      failed++;
    }
    await politeDelay();
  }

  if (!dryRun && (downloaded > 0 || failed > 0)) {
    console.info(`    images: ${downloaded} downloaded, ${failed} failed (kept original URL)`);
  }
  return $('#root').html() || html;
}

// --------------------------------------------------------------------------
// HTML → Markdown
// --------------------------------------------------------------------------

function makeTurndown() {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    hr: '---',
  });
  td.use(turndownPluginGfm.gfm);

  // Preserve <img> with attributes turndown would otherwise drop.
  td.addRule('keepImg', {
    filter: 'img',
    replacement: (_content, node) => {
      const alt = node.alt || '';
      const src = node.getAttribute('src') || '';
      const title = node.title ? ` "${node.title}"` : '';
      return src ? `![${alt}](${src}${title})` : '';
    },
  });

  // Strip the noisy "继续阅读" / recommend-block sections if present.
  td.addRule('dropShowMore', {
    filter: (node) =>
      node.nodeName === 'DIV' && /show-content-free|continue_reading/i.test(node.className || ''),
    replacement: () => '',
  });

  return td;
}

// --------------------------------------------------------------------------
// Main migration
// --------------------------------------------------------------------------

async function fileExists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function migrateOne({ slug, title: listTitle }, { dryRun, force }) {
  console.info(`\n▶ ${slug}  "${listTitle.slice(0, 40)}"`);

  const outPath = join(POSTS_DIR, `${slug}.md`);
  if (!force && !dryRun && await fileExists(outPath)) {
    console.info('  · already migrated, skipping (use --force to overwrite)');
    return { slug, status: 'skipped' };
  }

  const article = await getArticle(slug);
  if (!article.bodyHtml) {
    console.warn('  ! empty body, skipping');
    return { slug, status: 'empty' };
  }

  console.info(`  title: ${article.title}`);
  console.info(`  date:  ${article.pubDate?.toISOString().slice(0, 10)}`);

  const htmlWithLocalImages = await localizeImages(article.bodyHtml, slug, dryRun);
  const markdown = makeTurndown().turndown(htmlWithLocalImages).trim() + '\n';

  const frontmatter = {
    title: article.title,
    description: article.description,
    pubDate: article.pubDate,
    tags: [],
    lang: 'zh',
    draft: false,
    source: `${JIANSHU_BASE}/p/${slug}`,
  };

  const fileContent = matter.stringify(markdown, frontmatter);

  if (dryRun) {
    console.info(`  [dry-run] would write ${outPath} (${fileContent.length} bytes)`);
    return { slug, status: 'dry-run' };
  }

  await mkdir(POSTS_DIR, { recursive: true });
  await writeFile(outPath, fileContent, 'utf8');
  console.info(`  ✓ written ${outPath}`);
  return { slug, status: 'migrated' };
}

async function main() {
  const args = parseArgs();
  console.info('=== Jianshu → Astro migration ===');
  console.info(`user:    ${args.user}`);
  console.info(`dry-run: ${args.dryRun}`);
  console.info(`force:   ${args.force}`);
  console.info(`only:    ${args.only ? args.only.join(', ') : '(all)'}`);

  let articles;
  if (args.only) {
    articles = args.only.map((slug) => ({ slug, title: '(from --only)' }));
  } else {
    articles = await getArticleList(args.user);
  }

  if (articles.length === 0) {
    console.warn('No articles to process.');
    return;
  }

  const results = [];
  for (const art of articles) {
    try {
      const r = await migrateOne(art, args);
      results.push(r);
    } catch (err) {
      console.error(`  ✗ FAILED: ${/** @type {any} */ (err).message}`);
      results.push({ slug: art.slug, status: 'failed' });
    }
    await politeDelay();
  }

  // Summary
  const tally = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));
  console.info('\n=== Summary ===');
  for (const [k, v] of Object.entries(tally)) {
    console.info(`  ${k}: ${v}`);
  }
  const failed = results.filter((r) => r.status === 'failed');
  if (failed.length) {
    console.info('\nFailed slugs:');
    for (const f of failed) console.info(`  - ${f.slug}`);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
