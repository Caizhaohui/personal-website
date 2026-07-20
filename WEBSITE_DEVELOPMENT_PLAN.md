# 个人网站开发计划 (Development Plan)

> 状态：**阶段 1–5 全部完成**。本文档记录决策、实施过程与未来规划。

## 决策记录

| 项目 | 选择 | 理由 |
|------|------|------|
| 框架 | Astro 4.x | 内容优先，静态输出，SEO 最佳 |
| 内容 | Markdown + MDX | 简书迁移天然 Markdown，MDX 留给未来组件嵌入 |
| 样式 | 原生 CSS + CSS 变量 | 深浅色切换最干净，符合极简风 |
| 包管理 | pnpm | 与 06_OpenPlasmid / 04_LiteMark 一致 |
| Lint | Biome | 与 06_OpenPlasmid 一致 |
| 部署 | GitHub Actions → GitHub Pages | 代码 + 部署都在 GitHub |
| 语言 | 中文为主，i18n 结构预留 | 先单语，未来扩展双语不返工 |

## 已完成阶段

### 阶段 1：项目骨架 ✅
- Astro 4.16 + TypeScript strict
- @astrojs/mdx, @astrojs/sitemap
- pnpm 11, Biome 1.9, Node 24
- 配置文件（astro.config.mjs 动态读取 SITE_URL/SITE_BASE）

### 阶段 2：核心站点 ✅
- Content Collections schema（blog + projects，含 i18n 预留字段 lang/translations）
- 样式系统（global.css CSS 变量 + prose.css 中文排版，行高 1.8）
- 组件：BaseHead / Header / Footer / ThemeToggle（防闪烁内联脚本）/ PostCard / ProjectCard / TagList / FormattedDate
- 布局：BaseLayout / BlogPost / ProjectLayout
- 页面：首页 / 文章列表 / 文章详情 / 关于 / 标签云 / 标签详情
- 深浅色主题（CSS 变量 + localStorage 持久化 + prefers-color-scheme 跟随）
- 27 个文件类型检查 0 error

### 阶段 3：作品集 ✅
- 5 个项目数据（SeqBrio / LiteMark / SeqFlash / OpenPlasmid / CRISPR Design）
- 作品集列表 + 详情页
- 状态标签（active/maintenance/archived）+ 技术栈 chips

### 阶段 4：简书迁移 ✅
- 脚本 `scripts/migrate-jianshu.mjs`
- **关键决策：用简书的 `/asimov/p/<slug>` JSON API 而非 HTML 抓取**（页面正文是客户端渲染，axios 拿到的是空壳）
- 文章列表 API：`/asimov/users/slug/<id>/public_notes`
- 图片本地化到 `public/images/posts/<slug>/`，失败时 fallback 保留原 URL
- 增量迁移（已存在跳过，`--force` 覆盖）
- **9 篇文章 + 16 张图片全部迁移成功**
- 健壮性：polite delay（800–2200ms 随机）、3 次重试、`--dry-run`、`--only`、`--user`

### 阶段 5：部署 ✅
- GitHub Actions workflow（`.github/workflows/deploy.yml`）
- `actions/configure-pages` 自动检测 base path（无需手动配 repo name）
- SITE_URL/SITE_BASE 环境变量注入
- pnpm 缓存、Node 版本钉死（`.nvmrc`）

## 未来规划（YAGNI，按需启用）

| 功能 | 实现成本 | 触发条件 |
|------|---------|---------|
| RSS 订阅 | 极低（`@astrojs/rss`，5 行代码） | 有读者反馈 |
| 全站搜索 | 中（Pagefind，纯本地索引） | 文章数 > 20 |
| 评论系统 | 低（Giscus，需 GitHub Discussions） | 有读者互动需求 |
| 英文双语 | 中（i18n 字典已就位，需翻译 + 路由前缀） | 国际读者出现 |
| 文章 TOC | 低（Astro 内置 `getHeadings`） | 长文较多 |
| OG 图片自动生成 | 中（`@vercel/og` 或 Satori） | 社交分享需求 |
| 阅读时间估算 | 极低（字数 / 300） | 可选 |

## 技术债务 / 待办

- [ ] 作品集 5 个项目的 `repo`/`demo` 链接占位待补充真实 URL
- [ ] 迁移文章的 `tags` 字段为空，需手动补齐（可从标题前缀「数据整理」「生信软件」推断分类）
- [ ] `consts.ts` 的 `SOCIALS.github` 是占位 `https://github.com/`，需替换为真实 GitHub URL
- [ ] 迁移文章 slug 是简书短哈希（如 `27a2f46f1a04`），可考虑改为更友好的英文 slug
