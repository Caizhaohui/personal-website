# 个人网站 (Personal Website)

基于 Astro 构建的个人博客与项目作品集。内容主要由[简书](https://www.jianshu.com/u/36f606498ed2)迁移而来，托管于 GitHub Pages。

## 技术栈

- **[Astro](https://astro.build)** — 静态站点生成器，内容优先
- **Markdown / MDX** — 文章内容格式
- **pnpm** — 包管理
- **Biome** — 代码格式化与 lint
- **GitHub Actions** — 自动部署到 GitHub Pages

## 快速开始

### 环境要求

- Node.js ≥ 20（推荐 24，见 `.nvmrc`）
- pnpm ≥ 10

### 安装与本地开发

```bash
pnpm install
pnpm dev      # 启动开发服务器 http://localhost:4321
```

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务器（热重载） |
| `pnpm build` | 构建生产版本到 `dist/` |
| `pnpm preview` | 预览构建结果 |
| `pnpm check` | TypeScript / Astro 类型检查 |
| `pnpm lint` | Biome 代码检查 |
| `pnpm format` | Biome 格式化（写入） |
| `pnpm migrate:jianshu -- --dry-run` | 模拟简书迁移（不写文件） |
| `pnpm migrate:jianshu` | 执行简书迁移 |

## 目录结构

```
.
├── .github/workflows/deploy.yml   # GitHub Pages 自动部署
├── astro.config.mjs               # Astro 配置（site/base 动态读取）
├── scripts/
│   └── migrate-jianshu.mjs        # 简书内容迁移脚本
├── public/
│   ├── favicon.svg
│   └── images/posts/              # 文章图片（迁移时本地化）
└── src/
    ├── components/                # Astro 组件（Header/Footer/PostCard 等）
    ├── content/
    │   ├── config.ts              # Content Collections schema
    │   ├── blog/                  # 博客文章（.md）
    │   └── projects/              # 项目作品集（.md）
    ├── i18n/ui.ts                 # UI 文案字典（预留双语）
    ├── layouts/                   # 页面布局
    ├── pages/                     # 路由页面
    ├── styles/                    # global.css + prose.css
    └── consts.ts                  # 站点元信息（标题/作者/社交链接）
```

## 写作

### 新建博客文章

在 `src/content/blog/` 下新建 `<slug>.md`：

```markdown
---
title: 文章标题
description: 一句话摘要（可选）
pubDate: 2026-01-01
tags: [标签1, 标签2]
lang: zh
draft: false
---

正文内容（Markdown）……
```

### 新建项目

在 `src/content/projects/` 下新建 `<slug>.md`：

```markdown
---
name: 项目名
description: 一句话描述
techStack: [Rust, TypeScript]
repo: https://github.com/user/repo
demo: https://example.com
status: active
pubDate: 2026-01-01
featured: true
order: 1
---

项目详情……
```

## 简书迁移

迁移脚本通过简书的内部 API（`/asimov/p/<slug>`）抓取文章，转为 Markdown 并本地化图片。

```bash
# 模拟运行（查看会迁移哪些文章，不写文件）
pnpm migrate:jianshu -- --dry-run

# 迁移所有文章
pnpm migrate:jianshu

# 迁移指定文章
pnpm migrate:jianshu -- --only <slug1> <slug2>

# 强制覆盖已迁移的文章
pnpm migrate:jianshu -- --force

# 迁移其他用户
pnpm migrate:jianshu -- --user <jianshu-user-id>
```

迁移完成后，文章会带 `source` 字段指向原简书链接以供溯源。

## 部署

1. 将仓库推送到 GitHub。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 推送到 `main` 分支即可自动部署。
4. 访问 `https://<username>.github.io` 或 `https://<username>.github.io/<repo>/`。

`base` 路径由 `actions/configure-pages` 自动检测，无需手动配置。

## 个性化

编辑 `src/consts.ts` 修改站点标题、作者、简介、社交链接。
编辑 `src/styles/global.css` 的 CSS 变量调整配色。
