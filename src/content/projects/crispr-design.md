---
name: CRISPR Design
description: CRISPR sgRNA 设计与评估工具，辅助实验方案选择。
techStack:
  - Python
  - Bioinformatics
repo: ''
demo: ''
status: maintenance
pubDate: 2023-09-01
featured: false
order: 5
---

## 概述

CRISPR Design 是一个用于设计 CRISPR/Cas9 向导 RNA（sgRNA）的辅助工具。它根据目标序列计算候选 sgRNA，并结合脱靶预测、效率评分给出推荐。

## 特性

- **候选扫描**：在目标区域内枚举 PAM 邻近位点。
- **脱靶评估**：对候选位点做全基因组比对评分。
- **效率排序**：按综合得分排序输出。

> 项目处于维护状态，核心算法稳定，新需求按需迭代。
