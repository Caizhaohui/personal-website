/**
 * Site-wide constants. Edit these to customize the site.
 */
export const SITE_TITLE = '你猜我菜不菜';
export const SITE_DESCRIPTION = '个人博客与项目作品集 — 记录生物信息学、数据分析与软件开发';
export const SITE_AUTHOR = '你猜我菜不菜';
export const SITE_LANG = 'zh-CN';

/** Brief intro shown on the homepage hero and the about page. */
export const SITE_BIO =
  '生物信息学爱好者 / 全栈开发者。在这里记录数据分析、工具开发与学习笔记。';

/** Social / contact links shown in header/footer. Leave empty to hide. */
export const SOCIALS: {
  github: string;
  jianshu: string;
  email: string;
} = {
  github: 'https://github.com/Caizhaohui', // TODO: replace with your GitHub URL
  jianshu: 'https://www.jianshu.com/u/36f606498ed2',
  email: '', // e.g. 'mailto:you@example.com'
};

/** Number of posts shown on the homepage before "view all". */
export const POSTS_PER_PAGE = 10;

/** Posts dir under src/content (used by collections + migration script). */
export const POSTS_DIR = 'src/content/blog';
export const PROJECTS_DIR = 'src/content/projects';
