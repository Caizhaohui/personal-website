---
title: 「生信软件」PAMlogo：PAM 文库测序分析一站式流水线
description: 面向 Cas9 等基因编辑系统的 PAM 偏好分析命令行工具：从原始 FASTQ 到 WebLogo 图，质控、拆分、PAM 计数、Top-N 筛选、加权出图一条龙。
pubDate: 2026-08-07
tags:
  - 生信软件
  - 基因编辑
  - PAM
  - 测序分析
  - Python
lang: zh
source: https://github.com/Caizhaohui/PAMlogo
---

## 这个工具做什么

研究 Cas9 蛋白的 PAM 偏好，需要把 PAM 文库的高通量测序数据从头到尾处理一遍：质控、按 barcode 拆样本、统计每条靶序列下游的 PAM、取高频 PAM、最后画 logo 图。PAMlogo 把这条链路打包成一条命令：

```bash
pamlogo run --config my_run.yaml
```

## 全流程（v0.3）

```text
原始 FASTQ (R1[/R2])
        │
        ▼
   [1] fastp            质控 / 修剪 / QC 报告
        │
        ▼
   [2] seqmux           按 barcode 拆分样本
        │
        ▼
   [3] find_pam         靶序列下游 N nt PAM 计数（Count 降序 + Rank）
        │
        ▼
   [4] Top-N 筛选       默认 top50，可自定义（--top-n / YAML）
        │
        ▼
   [5] WebLogo          对 Top-N PAM 按 Count 加权出图
```

## 模块亮点

| 模块 | 说明 |
|------|------|
| **seqmux demux** | 复用我写的 [SeqMux](/posts/seqmux/)（Rust 实现），无 Python/pigz 运行时依赖；支持 SE/PE、质量与 adapter 修剪 |
| **fastp QC** | 原始 FASTQ 质控，输出 clean 数据与 HTML/JSON 报告 |
| **Ultraplex 兼容** | 旧 `BARCODE:sample` 条码文件自动转换为 SeqMux CSV，老项目无痛迁移 |
| **PAM 计数** | 等价 `find_pam.py`：靶序列下游 N 碱基计数，Count 降序 + Rank |
| **Top-N + WebLogo** | 默认 top50 送入本地 WebLogo 按 Count 加权出图 |
| **加权 FASTA** | 可导出下采样 FASTA，方便上传 WebLogo 官网 Create 页 |
| **YAML 流水线** | 支持全流程 / 跳过 qc·demux / logo-only 三种模式 |

## 安装依赖

- Python ≥ 3.9
- [fastp](https://github.com/OpenGene/fastp)（`conda install -c bioconda fastp`）
- [SeqMux](https://github.com/Caizhaohui/SeqMux)（需 Rust 1.74+ 编译）
- 可选：Ghostscript，用于 WebLogo 导出 PDF/PNG

另外还内置了 SLURM 提交模板，HPC 环境可以直接投递。参数默认值与实际做过的 292 PAM 实验对齐，开箱即用。

## 与其他工具的关系

PAMlogo 是流程整合层——单点工具各司其职（fastp 质控、SeqMux 拆分、WebLogo 画图），PAMlogo 负责把它们串成可复现的一键流水线，并用 YAML 固定参数。

## 相关链接

- GitHub：[Caizhaohui/PAMlogo](https://github.com/Caizhaohui/PAMlogo)
