/**
 * Derive magazine-style kicker, display title, and accent color from a post
 * without requiring frontmatter changes.
 */

export type MagazineColor = 'teal' | 'amber' | 'blue' | 'rose' | 'olive' | 'violet';

export interface PostVisual {
  /** Category label shown above the title (e.g. 「生信软件」). */
  kicker: string;
  /** Title with 「…」 prefix stripped when it became the kicker. */
  displayTitle: string;
  /** CSS variable name, e.g. `--magazine-teal`. */
  accentVar: string;
  color: MagazineColor;
}

const TITLE_PREFIX_RE = /^「([^」]+)」/;

const PREFIX_COLOR: Record<string, MagazineColor> = {
  生信软件: 'teal',
  软件: 'blue',
  数据整理: 'amber',
};

const COLORS: MagazineColor[] = ['teal', 'amber', 'blue', 'rose', 'olive', 'violet'];

/** Stable hash so the same slug always maps to the same palette slot. */
function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function colorToVar(color: MagazineColor): string {
  return `var(--magazine-${color})`;
}

/**
 * Resolve visual metadata for a blog post card / article header.
 */
export function getPostVisual(title: string, tags: string[], slug: string): PostVisual {
  const match = title.match(TITLE_PREFIX_RE);
  if (match) {
    const prefix = match[1];
    const color = PREFIX_COLOR[prefix] ?? COLORS[hashSlug(slug) % COLORS.length];
    return {
      kicker: `「${prefix}」`,
      displayTitle: title.slice(match[0].length).replace(/^[:：\s]+/, ''),
      accentVar: colorToVar(color),
      color,
    };
  }

  if (tags.length > 0) {
    const tag = tags[0];
    const color = COLORS[hashSlug(tag + slug) % COLORS.length];
    return {
      kicker: tag,
      displayTitle: title,
      accentVar: colorToVar(color),
      color,
    };
  }

  const color = COLORS[hashSlug(slug) % COLORS.length];
  return {
    kicker: '笔记',
    displayTitle: title,
    accentVar: colorToVar(color),
    color,
  };
}
