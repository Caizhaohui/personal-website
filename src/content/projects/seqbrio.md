---
name: SeqBrio
description: 高性能基因组序列处理工具包，基于 Rust 实现，提供常用序列操作的命令行与库接口。
techStack:
  - Rust
  - Cargo Workspace
  - GitHub Actions
repo: ''
demo: ''
status: active
pubDate: 2024-06-01
featured: true
order: 1
---

## 概述

SeqBrio 是一个用 Rust 编写的基因组序列处理工具包，目标是提供一组高性能、可组合的命令行工具与 Rust 库，覆盖 FASTA/FASTQ 解析、序列变换、k-mer 计数等常见任务。

## 特性

- **多 crate workspace 架构**：核心库、CLI 应用、基准测试独立分离。
- **零拷贝解析**：针对大文件做了流式与零拷贝优化。
- **完整的 CI**：lint、测试、覆盖率、跨平台构建全部在 GitHub Actions 中完成。

> 待补充：项目仍在积极开发中，文档与示例将陆续完善。
