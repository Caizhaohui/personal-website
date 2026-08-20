---
title: 「生信软件」SAMRust：pysam 兼容的 Rust 原生 HTS 处理库
description: 面向 Linux/HPC 的多线程 BAM/CRAM/VCF 处理库：Python 语义不变、热点路径跑在 Rust 上，fetch/count/coverage/depth/pileup 与 pysam 结果对齐、性能对齐 rubam。
pubDate: 2026-08-13
tags:
  - 生信软件
  - Rust
  - BAM
  - pysam
  - 高性能计算
lang: zh
source: https://github.com/Caizhaohui/SAMRust
---

## 定位

重测序分析里 pysam 是绕不开的库，但纯 Python 在大 BAM 上跑窗口统计、覆盖度计算时性能瓶颈明显。SAMRust 的思路很克制：**不重写整个 pysam**，只把最常用的热路径（区域 `fetch`、`count`、`count_coverage`、depth、pileup、只读 `VariantFile`）搬到 Rust，**Python 侧语义保持不变**——已有脚本几乎零改动就能换上。

设计基线一句话：**功能和结果对齐 pysam，运行效率对齐 rubam**。

## 架构与实现

- 解码层用 [noodles](https://github.com/zaeleus/noodles)（Rust HTS 生态标准库）
- 区域并行用 rayon，多线程统计路径不把整条 BAM 记录物化成 Python 对象
- **确定性并行**：1 线程输出 == N 线程输出（bit-exact），这对可复现性至关重要

## 功能一览（v0.1.1）

| 能力 | 状态 |
|------|------|
| BAM 顺序迭代 + 索引 `fetch`（BAI/CSI） | ✅ |
| `count` / `count_coverage` / `depth_*` / `pileup_counts` | ✅ 串行 + `threads=` |
| `parallel_fetch` / `iter_batches` | ✅ BAM only，区域合并 + 位置归属 |
| CRAM 读取 | ✅ |
| 只读 `VariantFile`（VCF/BCF） | ✅ |
| CLI 工具 | ✅ |

坐标系统与 pysam 完全一致（Python 风格 0-based half-open），`AlignmentFile` / `AlignedSegment` API 按 pysam 的形状设计。

## 适合与不适合

**适合：**

- 已有 pysam 脚本，只想把 `count` / coverage / depth / pileup 换成更快实现
- HPC 上对真菌等重测序 BAM 做窗口统计、候选位点 recount
- 需要 1 线程 == N 线程输出的确定性并行

**不适合：** 当完整 pysam / samtools / bcftools 替代品（写操作、复杂过滤等不在范围内，详见 README 的"明确不做"清单）。

## 安装

当前版本 v0.1.1（2026-08-13），支持 Python 3.10–3.13，Linux x86_64，MIT 许可证。wheel 从 [Releases](https://github.com/Caizhaohui/SAMRust/releases/tag/v0.1.1) 页面获取。

## 在我的工具链里的位置

SAMRust 专注 Linux/HPC 端的 BAM 级分析，与 Windows 端的 [SeqBrio](/posts/seqbrio/) / [SeqFlash](/posts/seqflash/)（FASTA/FASTQ 层）互补，覆盖了从原始序列到比对后数据的常见处理场景。

## 相关链接

- GitHub：[Caizhaohui/SAMRust](https://github.com/Caizhaohui/SAMRust)
- Release：[v0.1.1](https://github.com/Caizhaohui/SAMRust/releases/tag/v0.1.1)
