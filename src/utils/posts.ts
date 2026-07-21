/**
 * Helpers for working with the blog collection.
 * Centralized so sorting/filtering is consistent across pages.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * All published posts (drafts excluded in production), newest first.
 * Drafts are included during `astro dev` so authors can preview them.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  return posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

/** Build a map of tag -> posts, sorted by post count desc then name. */
export async function getTagMap(): Promise<Map<string, Post[]>> {
  const posts = await getPublishedPosts();
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const list = map.get(tag) ?? [];
      list.push(post);
      map.set(tag, list);
    }
  }
  return new Map(
    [...map.entries()].sort((a, b) => {
      const cnt = b[1].length - a[1].length;
      return cnt !== 0 ? cnt : a[0].localeCompare(b[0], 'zh-Hans-CN');
    }),
  );
}
