---
name: OpenPlasmid
description: 质粒设计与管理的 TypeScript 单仓库应用，含多个 apps 与共享 packages。
techStack:
  - TypeScript
  - pnpm Workspace
  - Biome
repo: ''
demo: ''
status: active
pubDate: 2025-01-15
featured: true
order: 4
---

## 概述

OpenPlasmid 是一个面向分子生物学实验室的质粒设计与管理平台，采用 TypeScript 单仓库（monorepo）架构组织，便于多端共享核心逻辑。

## 特性

- **monorepo 设计**：`apps/` + `packages/` + `pnpm-workspace.yaml`。
- **统一工具链**：Biome 负责格式化与 lint，配置极简。
- **类型安全**：跨包共享类型与工具函数。

> 待补充。
