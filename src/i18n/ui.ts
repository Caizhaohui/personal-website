/**
 * UI string dictionary.
 *
 * Currently only `zh` is used. `en` is reserved for future bilingual support.
 * Usage in components:
 *   import { t, type Lang } from '@i18n/ui';
 *   const lang: Lang = 'zh';
 *   <span>{t('nav.home', lang)}</span>
 */

export type Lang = 'zh' | 'en';

export const languages: Lang[] = ['zh'];

export const defaultLang: Lang = 'zh';

export const ui = {
  zh: {
    'nav.home': '首页',
    'nav.posts': '文章',
    'nav.tags': '标签',
    'nav.about': '关于',
    'home.latestPosts': '最新文章',
    'home.viewAll': '查看全部 →',
    'post.publishedOn': '发布于',
    'post.updatedOn': '更新于',
    'post.tags': '标签',
    'post.source': '原文链接',
    'posts.empty': '暂无文章',
    'tags.title': '标签',
    'tags.count': '篇',
    'tags.back': '返回所有标签',
    'theme.toggle': '切换主题',
    'footer.builtWith': '使用 Astro 构建',
    'common.back': '← 返回',
  },
  en: {
    'nav.home': 'Home',
    'nav.posts': 'Posts',
    'nav.tags': 'Tags',
    'nav.about': 'About',
    'home.latestPosts': 'Latest Posts',
    'home.viewAll': 'View all →',
    'post.publishedOn': 'Published',
    'post.updatedOn': 'Updated',
    'post.tags': 'Tags',
    'post.source': 'Original source',
    'posts.empty': 'No posts yet',
    'tags.title': 'Tags',
    'tags.count': 'posts',
    'tags.back': 'Back to all tags',
    'theme.toggle': 'Toggle theme',
    'footer.builtWith': 'Built with Astro',
    'common.back': '← Back',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)[typeof defaultLang];

/** Look up a UI string. Falls back to the key itself if missing. */
export function t(key: UIKey, lang: Lang = defaultLang): string {
  return ui[lang]?.[key] ?? ui[defaultLang][key] ?? key;
}
