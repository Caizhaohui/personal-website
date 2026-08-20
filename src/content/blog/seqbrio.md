---
title: 「生信软件」SeqBrio：Windows 优先的轻量 FASTA/FASTQ 处理工具包
description: Rust 实现的 Windows 桌面 + CLI 双形态序列处理工具包，四大核心命令（stats/cat/revcomp/validate），无需 Python/Perl/Conda/WSL。
pubDate: 2026-08-06
tags:
  - 生信软件
  - Rust
  - FASTA
  - FASTQ
  - CLI
lang: zh
source: https://github.com/Caizhaohui/SeqBrio
---

## 项目定位

*Brio* 在意大利语里是"活力"的意思——SeqBrio 的目标就是给 Windows 日常使用提供**快速、有活力的序列处理工具**，不依赖 Python/Perl/Conda/WSL。

它提供两种形态，共享同一个 Rust 核心库：

- **CLI**（`seqbrio.exe`）：脚本化和批处理场景
- **桌面应用**（SeqBrio Desktop）：每个命令一个任务页，图形化操作

## 四大核心命令

```
seqbrio stats      # 流式统计：记录数、碱基数、GC%、Q20/Q30、N50（可选）
seqbrio cat        # 规范化 FASTX（解析后重新输出，FASTA 行宽 0）
seqbrio revcomp    # 反向互补（IUPAC 兼容，FASTQ 质量值同步反转）
seqbrio validate   # 检测损坏的 gzip、截断的 FASTQ、非法碱基等
```

定位是一个**聚焦的 FASTA/FASTQ 工具包**，不是 SeqKit 的重写——不做 BAM/VCF/GFF，不做比对、组装、变异检测。范围之外的想法统一记录在 `BACKLOG.md`，绝不进入当前里程碑（范围冻结规则）。

## 路线图（第一阶段：Windows 优先）

| 里程碑 | 状态 | 交付物 |
|--------|------|--------|
| **M0** 仓库初始化 | ✅ 当前 | Cargo workspace、三 crate、Windows CI、文档 |
| M1 Windows FASTX I/O | ⏳ 下一步 | 流式 FASTA/FASTQ + gzip 读写 |
| M2 `stats` + `validate` | 计划 | 统计与校验命令 |
| M3 `cat` + `revcomp` | 计划 | 规范化与反向互补 → **v0.1.0** |
| M4 性能优化 | 计划 | 四大核心命令调优 |
| M5 v0.2 操作集 | 计划 | `head` / `filter` / `grep` / `sample` / `pair` |
| M6 桌面端打磨 | 计划 | 任务历史、取消、拖放 |
| M7 v1.0 发布 | 计划 | 便携 ZIP、SHA-256、基准报告 |

第一阶段明确只支持 Windows 10/11 x86-64；Linux/macOS/WSL/Docker/Conda 都是非目标。

## 工程实践

- Cargo workspace 多 crate 架构（核心库 / CLI / 桌面应用分离）
- Windows CI（GitHub Actions）持续验证
- MIT 许可证

## 相关链接

- GitHub：[Caizhaohui/SeqBrio](https://github.com/Caizhaohui/SeqBrio)
