// @ts-check
/**
 * Fix image files whose extension doesn't match their actual format.
 *
 * Jianshu's CDN returns WebP to browsers (via Accept negotiation), so most
 * downloaded images are actually WebP bytes saved as .jpeg/.png/.jpg.
 * GitHub Pages serves Content-Type by extension, so a WebP payload labeled
 * image/png can break in strict renderers (some RSS readers, older apps).
 *
 * This script:
 *   1. Walks public/images/posts/**, sniffs each file's magic bytes.
 *   2. Renames mismatched files to their true extension (.webp etc).
 *   3. Rewrites all matching references in src/content/blog/*.md.
 *
 * Usage: node scripts/fix-image-extensions.mjs [--dry-run]
 */
import { readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const IMAGES_ROOT = join(ROOT, 'public', 'images', 'posts');
const BLOG_DIR = join(ROOT, 'src', 'content', 'blog');

const dryRun = process.argv.includes('--dry-run');

/** Detect real image format from magic bytes. */
function detectFormat(buf) {
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46
  ) {
    return 'webp'; // RIFF....WEBP
  }
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'png'; // \x89PNG
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'jpg'; // JPEG SOI
  }
  if (buf.length >= 6 && buf.slice(0, 3).toString() === 'GIF') {
    return 'gif';
  }
  return null;
}

const EXT_BY_FORMAT = { webp: '.webp', png: '.png', jpg: '.jpg', gif: '.gif' };

async function main() {
  console.info(`=== Fix image extensions (dry-run: ${dryRun}) ===`);
  const renames = []; // { from, to } site-relative paths

  const postDirs = await readdir(IMAGES_ROOT, { withFileTypes: true });
  for (const dirEnt of postDirs) {
    if (!dirEnt.isDirectory()) continue;
    const dir = join(IMAGES_ROOT, dirEnt.name);
    const files = await readdir(dir);
    for (const file of files) {
      const fullPath = join(dir, file);
      const buf = await readFile(fullPath);
      const fmt = detectFormat(buf);
      if (!fmt) {
        console.warn(`  ? unknown format: ${file}`);
        continue;
      }
      const correctExt = EXT_BY_FORMAT[fmt];
      const currentExt = extname(file).toLowerCase();
      if (currentExt === correctExt) continue;
      // .jpeg and .jpg both mean JPEG — treat .jpeg→.jpg as cosmetic, skip.
      if (fmt === 'jpg' && currentExt === '.jpeg') continue;
      // extname() returns '' for extensionless files; slice(0, -0) would
      // truncate to empty string and collide every file onto ".webp".
      // Guard explicitly instead.
      const stem = currentExt.length > 0 ? file.slice(0, -currentExt.length) : file;
      const newFile = stem + correctExt;
      if (!newFile || newFile.startsWith('.')) {
        console.warn(`  ! skipping malformed rename target for ${file}`);
        continue;
      }
      renames.push({
        from: `/images/posts/${dirEnt.name}/${file}`,
        to: `/images/posts/${dirEnt.name}/${newFile}`,
        fullFrom: fullPath,
        fullTo: join(dir, newFile),
        fmt,
        currentExt,
      });
    }
  }

  console.info(`Files needing rename: ${renames.length}`);

  if (dryRun) {
    for (const r of renames.slice(0, 10)) {
      console.info(`  [dry-run] ${r.from}  (${r.currentExt} → .${r.fmt})`);
    }
    if (renames.length > 10) console.info(`  … and ${renames.length - 10} more`);
    return;
  }

  // 1. Rename files on disk.
  for (const r of renames) {
    await rename(r.fullFrom, r.fullTo);
  }
  console.info(`Renamed ${renames.length} files on disk.`);

  // 2. Rewrite references in every blog markdown file.
  const mdFiles = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.md'));
  let changedFiles = 0;
  for (const mdFile of mdFiles) {
    const mdPath = join(BLOG_DIR, mdFile);
    let content = await readFile(mdPath, 'utf8');
    let changed = false;
    for (const r of renames) {
      const before = content;
      content = content.split(`(${r.from})`).join(`(${r.to})`);
      if (content !== before) changed = true;
    }
    if (changed) {
      await writeFile(mdPath, content, 'utf8');
      changedFiles++;
    }
  }
  console.info(`Updated references in ${changedFiles} markdown files.`);
  console.info('Done.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
