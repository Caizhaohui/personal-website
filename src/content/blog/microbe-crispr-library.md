---
title: 「生信软件」Microbe-CRISPR-Library：微生物 CRISPR 文库设计工具与近期更新
description: >-
  介绍自研工具 Microbe-CRISPR-Library：面向细菌/真菌的批量 CRISPR 文库设计。重点记录最近的
  Cas9 knockout V11（动态 spacing）与 knockin V6 standalone（N_start / C_stop 双模式），并分享从
  V4 迭代到今天的开发路径与踩坑经验。
pubDate: 2026-08-02
tags:
  - 生信软件
  - CRISPR
  - Python
  - 基因编辑
  - 工具开发
lang: zh
draft: false
source: https://github.com/Caizhaohui/Microbe-CRISPR-Library
---

> 做微生物 CRISPR 文库设计时，经常不是挑一两个 guide，而是整条基因组、成百上千基因一起出 oligo。市面上很多工具偏单基因交互，批量场景里要自己写一堆脚本。这半年把零散脚本收敛成了 [Microbe-CRISPR-Library](https://github.com/Caizhaohui/Microbe-CRISPR-Library)，最近又推了 knockout V11 和 knockin V6 standalone，这里做个介绍，并记录一下开发路径。

##### 1. 这个工具解决什么问题

定位很简单：**批量 library 生成，而不是一个个挑 sgRNA**。

典型输出是两份 CSV：

- 成功表：可直接合成的 oligo 设计
- 失败/部分表：没凑满目标设计数的基因（`Failed` / `Partial`）

目前覆盖的模式包括：

- Cas9 knockout
- knockdown
- 启动子替换
- C 端融合
- CASTs 插入
- 双模式 knockin（`N_start` / `C_stop`）

输入支持两套（不要混用）：

- FASTA + GFF3
- GBFF

依赖很轻：

```bash
pip install pandas biopython gffutils
```

仓库地址：https://github.com/Caizhaohui/Microbe-CRISPR-Library

##### 2. 仓库怎么组织

核心原则就三条，是被“真实项目迭代”逼出来的：

1. **一个生物学任务对应一个脚本**（knockout / knockin / CASTs 分开）
2. **版本号写进文件名**，旧行为可复现，不轻易破坏已跑过的结果
3. **新约束尽量做成可叠加层**，而不是推倒重来

常用入口：

| 脚本 | 用途 |
| --- | --- |
| `Bact-CRISPR-Library.py` | 多模式调度入口 |
| `Cas9_knockout_designer_v11.py` | 当前 knockout 主入口（V11） |
| `CRISPR_knockin_v6_standalone.py` | 独立 knockin（`N_start` / `C_stop`） |
| `CASTs_designer_v3.py` | CASTs 插入 |

真菌 knockout 也走 `Cas9_knockout_designer_v11.py` 这条线。

##### 3. 最近更新一：Knockout V11（动态 spacing）

V11 是在 V9/V10 全局候选架构上，专门补“**同一基因多条设计怎么排开**”的问题。

###### 3.1 动态间距

默认 `--min_design_spacing 100`：

- CDS 长度 `>= 200 bp`：两条设计尽量间隔约 100 bp
- CDS 长度 `< 200 bp`：自动把 spacing 放宽到 `0 bp`，优先保证能出满 `--sgRNA_num`

短基因如果还硬卡 100 bp，第二条设计经常出不来，失败表里一堆 `Partial`。V11 就是为这个场景加的。

###### 3.2 梯度回退

即使动态 spacing 也凑不满时，再按阶段放松：

1. 目标动态 spacing
2. 一半 spacing
3. 最终 `0 bp`

`0 bp` 时也不是简单拿相邻高分候选，仍尽量让 cut site 分散一点。

###### 3.3 使用示例

Mt 策略（PAM 方向 cut-window）：

```bash
python Cas9_knockout_designer_v11.py \
  --dele_model Mt \
  --input_gbff Mt_genomic.gbff \
  --output Mt_V11_Mt_KO.csv \
  --synthesis_template Mt_knockout_library_oligo_template.txt \
  --species M_thermophila \
  --barcode_len 11 \
  --max_oligo_length 300 \
  --restriction_site GGTCTC GAAGAC
```

normal 策略（按删除长度约束）：

```bash
python Cas9_knockout_designer_v11.py \
  --dele_model normal \
  --input_gbff Mt_genomic.gbff \
  --output Mt_V11_normal_KO.csv \
  --synthesis_template Mt_knockout_library_oligo_template.txt \
  --species M_thermophila \
  --barcode_len 11 \
  --max_oligo_length 300 \
  --restriction_site GGTCTC GAAGAC \
  --del_length_per 10%:80% \
  --del_length_bp 300:1000
```

改基础间距：

```bash
python Cas9_knockout_designer_v11.py \
  --input_gbff Mt_genomic.gbff \
  --output Mt_V11_spacing80.csv \
  --synthesis_template Mt_knockout_library_oligo_template.txt \
  --species M_thermophila \
  --dele_model Mt \
  --min_design_spacing 80
```

`--min_design_spacing 80` 时，CDS 短于 160 bp 的基因会自动按 `0 bp` 处理。

> V9 起的 `--dele_model {normal,Mt}` 还在。Mt 走 cut-window，normal 走旧版长度约束；启动时会打审计日志，方便对照实验参数。

##### 4. 最近更新二：Knockin V6 standalone（双模式）

`CRISPR_knockin_v6_standalone.py` 把之前分散的 knockin 逻辑收成**单文件可运行**，两种插入模型共用一套流水线：

- `--model N_start`：在起始密码子前插入（启动子/RBS 类）
- `--model C_stop`：在终止密码子前插入（C 端标签融合）

共同步骤大致是：

1. 从 GBFF 解析 CDS
2. 以 junction 为中心建正负链上下文
3. 在 `junction ± search_window` 扫 PAM
4. 按策略优先级生成候选
5. 同源臂清洗 + 酶切位点过滤
6. 突变感知的 HA 平衡与 oligo 组装
7. 排序，每个基因取 top 设计

突变策略两级：

1. 优先同义突变
2. 不行再退到保守氨基酸组替换

尽量破 PAM，又尽量少动编码序列。

Standalone V6 里比较实用的点：

- 逻辑全部内联，不依赖外部 `knockin_J23119RBS_V*.py`
- `--max_offtargets`：全基因组 sgRNA 特异性过滤
- `--rank2_sim_max`：`C_stop` 下 Rank2 多样性控制
- `--barcode_seed`：barcode 可复现
- 同源臂长度可调，酶切位点可排除

N_start 示例：

```bash
python CRISPR_knockin_v6_standalone.py \
  --model N_start \
  --gbff MG1655_genomic.gbff \
  --payload J23119_RBS \
  --template Knockin_J23100RBS_library_oligo_template.fasta \
  --output CRISPR_Nstart_v6.csv \
  --num_designs 2 \
  --lha_len 70 --rha_len 70 \
  --barcode_seed 42 \
  --max_offtargets 0 \
  --restriction_site GGTCTC --restriction_site GAAGAC
```

C_stop 示例：

```bash
python CRISPR_knockin_v6_standalone.py \
  --model C_stop \
  --gbff MG1655_genomic.gbff \
  --payload J23119_RBS \
  --template Cfusion_library_oligo_template.fasta \
  --output CRISPR_Cstop_v6.csv \
  --num_designs 2 \
  --lha_len 70 --rha_len 70 \
  --barcode_seed 42 \
  --rank2_sim_max 50 \
  --max_offtargets 0 \
  --restriction_site GGTCTC --restriction_site GAAGAC
```

单基因调试：

```bash
python CRISPR_knockin_v6_standalone.py \
  --model C_stop \
  --target_gene b0002 \
  --gbff MG1655_genomic.gbff \
  --payload J23119_RBS \
  --template Cfusion_library_oligo_template.fasta \
  --output debug_b0002_cstop.csv
```

`--payload` 可以是序列字符串，也可以是 FASTA 文件。

##### 5. 开发路径：从“能跑”到“能复现”

这条线不是一开始就设计成 toolkit 的，而是项目里被需求一路推着长出来的。大致阶段：

| 阶段 | 解决的问题 | 收获 |
| --- | --- | --- |
| V4 | 多酶切位点模板（BsaI/BbsI）过滤不准 | 模板占位 + 酶切检查要按“完整 oligo”做，不能只看片段 |
| V5 | 删除长度要按基因比例设 | 支持 `50%:90%` 这类百分比区间 |
| V6 | 功能基本齐，但全基因组慢 | 先保证正确性，再谈速度 |
| V7 | 性能 | 候选枚举剪枝 + 物理区间预过滤 + 基因级多线程；Mt 约 9k 基因从 40–50s 到 10–15s 量级 |
| V9 | 细菌/真菌删除策略不一致 | `--dele_model {normal,Mt}` 策略路由 + 审计日志 |
| V10–V11 | 短基因难出满多条设计 | 全局候选 + 动态 spacing + 梯度回退 |
| knockin V6 | 多脚本难维护、难分发 | 双模式合并、standalone 单文件 |

几个刻在脑子里的经验：

**1）版本文件名比“大重构”更省心**

实验记录里经常写“用的是某天那版参数”。脚本改名成 `*_v11.py`，比 git 里翻半天靠谱。

**2）失败表和成功表一样重要**

一开始只输出成功设计，后面发现排库时最怕“沉默失败”——某个基因为什么没有 oligo 完全说不清。现在统一写 `*_failed.csv`，并区分 `Failed` / `Partial`。

**3）先保证可复现，再追求智能**

barcode 加了 seed，PAM 策略加了审计打印，同样输入 + 同样 seed 应得到同样输出。文库设计如果每次结果飘，实验侧对不上号。

**4）性能优化要贴生物学结构**

V7 并不是“把 Python 换成更快语言”，而是：

- 别对每个 sgRNA 穷举所有 del_len
- 短基因先砍掉不可能的删除区间
- 基因级并行，barcode 生成注意线程安全

正确性掉了再快也没用；当时对标 V6，覆盖率仍保持在可用区间。

**5）standalone 是给“别人能用”准备的**

内部可以依赖一串 helper，对外仓库如果还要配一堆路径就很劝退。knockin 收成单文件后，clone 下来就能跑，分发成本低很多。

##### 6. Knockout 主流程（心智模型）

不管版本号怎么涨，主链路一直差不多：

1. 读基因组与注释
2. 建基因/CDS 坐标（注意链向）
3. 枚举 sgRNA（PAM、反向互补、酶切过滤）
4. 计算 cut site
5. 按策略生成删除候选
6. 拼同源臂（受序列可用长度和 oligo 总长限制）
7. 生成 barcode（唯一性、GC、重复、酶切）
8. 用模板占位符组装合成 oligo
9. 排序，每个基因取 top N
10. 写成功/失败 CSV

心里有这张图，改参数时就不容易迷路。

##### 7. 小结与后续

[Microbe-CRISPR-Library](https://github.com/Caizhaohui/Microbe-CRISPR-Library) 目前更适合：

- 细菌/真菌全基因组或大批量基因的 Cas9 knockout 文库
- 需要 oligo-ready CSV 直接下单合成的场景
- 要在 start / stop 附近做插入或 C 端融合的 knockin 设计

近期重点就是 **knockout V11 的动态 spacing** 和 **knockin V6 standalone 双模式**。后面如果继续改，大概会优先：

- 更多物种默认模板与参数预设
- 更完整的 off-target 报告
- 结果摘要可视化（成功率、失败原因分布）

有用到类似场景欢迎提 issue / PR。这套工具还在跟着真实项目长，文档和参数也都会继续补。
