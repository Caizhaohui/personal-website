/**
 * Site-wide constants. Edit these to customize the site.
 */
export const SITE_TITLE = 'Caizhaohui';
export const SITE_DESCRIPTION = '个人博客与项目作品集 — 记录生物信息学、数据分析与软件开发';
export const SITE_AUTHOR = '你猜我菜不菜';
export const SITE_LANG = 'zh-CN';

/** Brief intro shown on the homepage hero and the about page. */
export const SITE_BIO =
  '基因编辑工具和生物信息学爱好者，喜欢用 Python、R 和 Rust 语言将混乱的生物数据锤炼成可靠、可复现的解决方案。';

/** Social / contact links shown in header/footer. Leave empty to hide. */
export const SOCIALS: {
  github: string;
  email: string;
} = {
  github: 'https://github.com/Caizhaohui', // TODO: replace with your GitHub URL
  email: '', // e.g. 'mailto:you@example.com'
};

/** Number of posts shown on the homepage before "view all". */
export const POSTS_PER_PAGE = 10;

/** Posts dir under src/content (used by collections + migration script). */
export const POSTS_DIR = 'src/content/blog';
