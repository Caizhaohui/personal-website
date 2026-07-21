import { defineCollection, reference, z } from 'astro:content';

/**
 * Blog posts collection.
 *
 * i18n strategy (currently Chinese-only, structure reserved for future EN):
 *   - `lang` field marks each post's language.
 *   - `translations` is an optional list of slugs in the OTHER language
 *     (added via reference() so Astro can resolve cross-language links).
 *   - Routes are currently flat (`/posts/[slug]`); adding a `/{lang}` prefix
 *     later won't require schema changes.
 */
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['zh', 'en']).default('zh'),
    draft: z.boolean().default(false),
    /** Original source URL (e.g. Jianshu) for provenance. */
    source: z.string().url().optional(),
    /** Slugs of the same post in the other language. */
    translations: z.array(reference('blog')).default([]),
  }),
});

export const collections = { blog };
