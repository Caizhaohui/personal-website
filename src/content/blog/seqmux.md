---
title: 「生信软件」SeqMux：Rust 编写的快速便携 FASTQ 拆分器
description: 基于样本 barcode 表的单端/双端 FASTQ demultiplexer：双 barcode 双方向匹配、UMI 提取、Hamming 容错、质量与 adapter 修剪、多线程有序输出，零运行时依赖。
pubDate: 2026-08-14
tags:
  - 生信软件
  - Rust
  - FASTQ
  - 测序
lang: zh
source: https://github.com/Caizhaohui/SeqMux
---

## 项目简介

**SeqMux** 是一个用 Rust 写的 FASTQ demultiplexer（拆分器），主打**快、便携、零依赖**：不需要 Python、Conda、pigz 或 SLURM，`cargo build --release` 之后一个静态二进制走天下。

## 核心特性（v0.1）

- **单端 / 双端** FASTQ（`.fastq` / `.fq` / `.gz`）
- **SeqMux 样本表**（CSV 带表头：`SampleNumber`, `Barcode1`, `Barcode2`, …）
- **双 barcode 拆分**：PE 数据自动尝试 R1/R2 两个方向；SE 数据支持 R1 5′ + 3′ 双端匹配
- **单 barcode 拆分**：仅用 Barcode1 在 R1 5′ 端匹配
- **UMI 支持**：barcode 中的 `N` 碱基被当作 UMI 提取，写入 read header 的 `rbc:` 标签
- **容错匹配**：Hamming 距离容错，平局（多条码等距）判为 unassigned，避免错分
- **修剪**：BWA 风格质量修剪 + 3′ adapter 修剪
- **有序输出**：多线程分块流水线，但每个样本的输出保持原始顺序
- **内置 gzip**：输出压缩不依赖外部工具
- 汇总 TSV + stderr 报告

## 快速上手

```bash
git clone https://github.com/Caizhaohui/SeqMux.git
cd SeqMux
cargo build --release
# 二进制：target/release/seqmux
```

**双端数据 + 双 barcode（推荐）：**

```bash
seqmux demux \
  -i mix_R1.fastq.gz \
  -I mix_R2.fastq.gz \
  -b sample_barcodes.csv \
  -o results \
  -t 8
```

**单端数据：**

```bash
seqmux demux \
  -i reads.fastq.gz \
  -b sample_barcodes.csv \
  -o results \
  -t 8
```

**FASTQ 校验：**

```bash
seqmux validate -i reads.fastq.gz
seqmux validate -i r1.fastq.gz -I r2.fastq.gz
```

## 样本表格式

只支持带表头的 CSV 一种输入（简单、可 diff、可版本管理），最小示例：

```csv
SampleNumber,Barcode1,Barcode2
S1,ACGTACGA,TTGCAACC
S2,GGTTACGT,AAGGCCTT
```

## 在工具链中的位置

SeqMux 是 [PAMlogo](/posts/pamlogo/) PAM 文库分析流水线的拆分引擎，也兼容 Ultraplex 风格的条码文件转换。后续计划纳入 [SeqBrio](/posts/seqbrio/) 的命令集。

## 相关链接

- GitHub：[Caizhaohui/SeqMux](https://github.com/Caizhaohui/SeqMux)
