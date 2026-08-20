---
title: 「生信软件」Saturated-mutagenesis-library-NNK：饱和突变文库 oligo 设计脚本
description: 给定野生型 DNA 序列，自动生成带重叠区的饱和突变（NNK）寡核苷酸文库——每个位点突变为其余 19 种氨基酸，使用大肠杆菌优化密码子，兼容 Gibson 组装。
pubDate: 2025-09-15
tags:
  - 生信软件
  - 基因编辑
  - 饱和突变
  - Python
lang: zh
source: https://github.com/Caizhaohui/Saturated-mutagenesis-library-NNK
---

## 这个脚本解决什么问题

做蛋白质定向进化时，饱和突变（saturation mutagenesis）文库的 oligo 设计是件繁琐的体力活：野生型序列要切成合适长度的片段、每段之间留足重叠区、每个氨基酸位点要生成 19 个突变体（跳过野生型本身）、密码子还要按宿主优化——手工在 Excel 里排又容易出错。

这个 Python 脚本把整条流程自动化了：输入野生型 DNA 序列和上下游引物，直接输出一份可用于合成的 oligo 清单（CSV）。

## 核心功能

- **片段化**：默认按 300 bp 目标长度切分野生型序列，相邻片段保留 60 bp 重叠区（两端各 30 bp 安全区）
- **饱和突变**：对每个氨基酸位点（起始密码子除外）生成 19 种突变，密码子采用 *E. coli* 优化
- **安全区保护**：重叠区内的序列保持野生型，不引入突变，保证下游 Gibson 等组装方法的兼容性
- **引物整合**：上下游 PCR 引物自动并入首尾片段
- **输入校验**：只允许 A/T/C/G，序列长度必须是 3 的倍数
- **覆盖率报告**：控制台输出每个片段的切片位置、突变位点范围，并对未覆盖位点或超长 oligo 给出警告

## 使用示例

```bash
python Saturation_mutation_NNK_v1.py \
  --wt_DNA <野生型DNA序列> \
  --output s9_NNK_oligo.csv
```

主要参数：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--wt_DNA` | 野生型 DNA 序列（必填） | — |
| `--up_primer` | 上游引物 | `ACAATTCTGCCTAGGAGATCT` |
| `--down_primer` | 下游引物 | `TGACATCTGtagtgcaACAAG` |
| `--oligo_len` | oligo 目标长度（bp） | 300 |
| `--safe_len` | 片段两端安全区长度（重叠 = 2 × safe_len） | 30 |

一次典型运行的输出：

```text
Fragment 1: slice [0:279], length 279, mutated aa 2 to 83
Fragment 2: slice [219:519], length 300, mutated aa 84 to 163
...
All amino acid positions (except start codon) covered.
Generated 8588 oligos. Saved to s9_NNK_oligo.csv
```

## 相比全 20 氨基酸饱和的优势

只生成 19 个突变体（排除野生型氨基酸）而不是 20 个，能显著降低 oligo 总量——对大基因的文库来说，合成的成本差距相当可观。

## 环境要求

Python 3.6+，只用标准库（`csv` / `math` / `argparse`），无需额外安装依赖。

## 相关链接

- GitHub：[Caizhaohui/Saturated-mutagenesis-library-NNK](https://github.com/Caizhaohui/Saturated-mutagenesis-library-NNK)
