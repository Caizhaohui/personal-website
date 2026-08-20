---
title: 「软件」LiteMark：本地优先的 Windows Markdown 桌面编辑器
description: 基于 Tauri 2 + Monaco + Milkdown + crossnote 的 Windows Markdown 编辑器：源码/混合/预览三种模式、离线 HTML/PDF/DOCX 导出、原子保存与崩溃恢复、无遥测无账号。
pubDate: 2026-08-16
tags:
  - 软件
  - Markdown
  - Rust
  - Tauri
  - 桌面应用
lang: zh
source: https://github.com/Caizhaohui/LiteMark
---

## 项目简介

**LiteMark** 是一个 Windows 桌面 Markdown 编辑器，核心理念三句话：**文件留在本地、编辑过程可控、预览保持忠实**。界面灵感来自 Typora 的工作流，但没有账号、没有遥测、不需要云同步——一个纯粹本地优先的编辑器。

## 技术架构

- **Monaco**（VS Code 的编辑器内核）：精确的源码编辑
- **Milkdown / ProseMirror**：可选混合（WYSIWYM）编辑模式，带数据丢失保护
- **crossnote**（Node 侧车进程）：实时预览、Mermaid、KaTeX、GFM 与导出
- **Rust 核心**：所有打开/保存/导出/渲染流量都经过 Rust 层授权路径、原子写入，与渲染侧车走 JSON-Lines IPC

关键安全设计：**webview 永远没有文件系统直接访问权**——所有文件操作都必须在 Rust 核心校验路径后执行。

## 功能亮点

| 功能 | 说明 |
|------|------|
| **源码模式** | Monaco：语法高亮、自动换行、查找替换、多光标、撤销重做 |
| **混合模式** | Milkdown；当 roundtrip 会不安全地重写内容时阻止切换 |
| **实时预览** | crossnote 管线——GFM、代码块、KaTeX、Mermaid；**只渲染未保存缓冲区**，不静默写盘 |
| **布局** | 源码 / 分栏 / 预览三模式，分栏比例可拖拽并记忆 |
| **导出** | 离线 HTML 包；PDF（系统 Edge/Chrome）；可选 Pandoc 的 DOCX/EPUB/LaTeX |
| **i18n** | 英文（默认）、简体中文、繁體中文、日本語 |
| **安全** | 原子保存、崩溃恢复快照、外部修改提醒、DOMPurify 消毒、可信工作区 |
| **隐私** | 无账号、无遥测、无需云同步 |
| **Windows UX** | `.md` 文件关联、单实例打开、冷启动 CLI 路径、侧车进程无控制台闪现 |

## 键盘快捷键

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+N` | 新建文档 |
| `Ctrl+O` | 打开 |
| `Ctrl+S` | 保存 |
| `Ctrl+Shift+S` | 另存为 |

## 安装与使用

最新版本 **v2.1.1**，提供 Windows 10/11 x64 的 NSIS 安装包（`LiteMark_2.1.1_x64-setup.exe`，按用户安装，无需管理员权限）。

安装后从开始菜单启动，打开 `.md` 文件（`Ctrl+O` 或双击关联文件），用工具栏在 源码/分栏/预览 之间切换，直接导出 HTML/PDF 等格式。

> 注意：预览和导出需要 Node.js 进程承载 crossnote。PDF 导出需要系统装有 Microsoft Edge 或 Google Chrome（或配置浏览器路径）。

## 相关链接

- GitHub：[Caizhaohui/LiteMark](https://github.com/Caizhaohui/LiteMark)
- 最新 Release：[v2.1.1](https://github.com/Caizhaohui/LiteMark/releases/tag/v2.1.1)
