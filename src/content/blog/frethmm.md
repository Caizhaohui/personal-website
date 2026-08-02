---
title: 「生信软件」FretHMM：单分子时间序列 HMM 状态分类工具
description: >-
  介绍开源工具 FretHMM：受 HaMMy 启发、用 Python 重写的单分子轨迹 HMM 分类。覆盖 CLI/GUI、Review Grid、
  multi-start + BIC、ON/OFF 与 dwell 动力学，以及 v1.5–v1.6 的批次审查与 Windows 并行更新。
pubDate: 2026-08-02
tags:
  - 生信软件
  - 单分子
  - FRET
  - HMM
  - Python
lang: zh
draft: false
source: https://github.com/Caizhaohui/FretHMM
---

> 单分子荧光 / smFRET 轨迹做状态分类时，经典工具 [HaMMy](https://github.com/Ha-SingleMoleculeLab/HaMMy) 很好用，但跨平台、批量、GUI 和后续动力学统计往往要自己拼一堆脚本。我把这套流程用 Python 从零重写成了 [FretHMM](https://github.com/Caizhaohui/FretHMM)，目前到 **v1.6.0**：HMM 分类、批量 Review Grid、ON/OFF 事件、dwell 速率拟合、中英文 GUI 和 Windows 单文件 EXE 都在一条工具链里。这里做个介绍，并记一下近期更新与开发路径。

##### 1. 这个工具解决什么问题

[FretHMM](https://github.com/Caizhaohui/FretHMM) 面向 **单分子时间序列的 HMM 状态分类**，核心是 Baum-Welch 训练 + Viterbi 解码（基于 hmmlearn），再往下游接到审查与动力学统计。

主要能力：

| 模块 | 说明 |
| --- | --- |
| HMM 引擎 | 可自定义初值；支持 multi-start 与 BIC 自动选态数 |
| 数据模式 | 自动识别 / 单通道 / 双通道 Donor–Acceptor（自动算 FRET efficiency） |
| 批量 | 多文件并行（`ProcessPoolExecutor`）+ 目录扫描 |
| Review Grid | 批量分类 + 分页多面板 PNG，方便人工质控 |
| 低态窗口过滤 | 两遍 HMM：找到首次持续低态窗口后裁剪再拟合 |
| CLI | `run` / `review-grid` / `tdp` / `events` / `dwell-stats` / `gui` |
| GUI | CustomTkinter，深浅色主题，中英切换，后台线程/进程池 |
| 输出 | `*_classified.csv`、`*_summary.json`、`*report.dat`、`*path.dat`、`*dwell.dat` |
| TDP | Transition Density Plot + 速率高斯拟合接口 |
| 打包 | PyInstaller 目录模式 / `--onefile` Windows EXE |

安装：

```bash
git clone https://github.com/Caizhaohui/FretHMM.git
cd FretHMM
pip install -e .

# 可选
pip install -e ".[dev]"   # pytest
pip install -e ".[gui]"   # PyInstaller 打包
```

要求：Python ≥ 3.10，NumPy / SciPy / hmmlearn / matplotlib / customtkinter。

不装 Python 时，Release 里有 Windows 单文件 `FretHMM.exe`（附 SHA-256 校验）。

##### 2. 快速上手：CLI 六条命令

###### 2.1 `run` — HMM 状态分类

```bash
# 单文件，2 态，自动识别格式
frethmm run --files trace.csv --states 2 --output-dir ./results/

# 整目录批量，4 进程
frethmm run --input-dir ./traces/ --states 5 --workers 4 --output-dir ./results/

# 初值（态间距小时很有用）
frethmm run --files data.csv --states 2 --guesses "0.3,0.7"

# multi-start + BIC 自动选态
frethmm run --input-dir ./traces/ --states auto --min-states 2 --max-states 5 --workers 4

# 低态窗口过滤：保留到首次持续 5 s 的最低态窗口，再二次分类
frethmm run --files trace.csv --states 2 --low-state-tail-trim-seconds 5.0
```

`--input-dir` 会扫 `.csv` / `.dat` / `.txt` / `.tsv`，并自动跳过已有输出文件。单个文件失败不中断整批。

###### 2.2 `review-grid` — 批量视觉审查

```bash
frethmm review-grid --input-dir ./traces/ --output review.png --states 2 --rows 4 --cols 8 --workers 4
```

每格叠画 raw（灰）+ classified（红），标题带文件名、log-likelihood、state means；有 warning 的用橙色边框标出。超过一页会自动分页 `review_page_01.png` …

典型工作流：

```bash
# 1. 先拼图扫一遍质量
frethmm review-grid --input-dir ./traces/ --output review.png --states 2 --rows 4 --cols 8

# 2. 问题轨迹单独重跑
frethmm run --files traces/bad_trace.csv --states 3 --guesses "0.1,0.5,0.9" -v

# 3. 审查通过后再批量出完整结果
frethmm run --input-dir ./traces/ --states 2 --workers 4 --output-dir ./results/
```

###### 2.3 `tdp` — Transition Density Plot

```bash
frethmm tdp --input-dir ./results/ --exposure 0.1 --output tdp.png
```

###### 2.4 `events` + `dwell-stats` — ON/OFF 与速率

```bash
# 从 classified 抽 ON/OFF
frethmm events --input-dir ./results/ --output-dir ./events/

# dwell 描述统计 + 单指数 A·exp(-k·t) 拟合
frethmm dwell-stats --input ./events/event_details.csv --output-dir ./stats/
```

2 态轨迹：高荧光为 ON；低段只有在后面又回到高（`high → low → high`）才记 OFF，**末尾不可恢复的低态（漂白/失活）不记进 OFF**。3 态及以上：每个非最低活跃态独立统计，下降只有回到原阶段才算 OFF。

速率含义：

- `on_rate_constant` ≈ 离开 ON 的速率（≈ 动力学里的 \(k_\mathrm{off}\)）
- `off_rate_constant` ≈ 离开 OFF 的速率（≈ \(k_\mathrm{on}\)）

###### 2.5 `gui`

```bash
frethmm gui
```

GUI 支持多文件夹批次、每文件夹独立态数/模式、Review Grid 导出、ON/OFF 分析入口、输出冲突时选择覆盖 / 取消 / `_v2` 版本目录等。Workers 在 GUI 默认 2（范围 1–4），CLI 默认仍是 1。

##### 3. 输入与输出

**单通道**（带表头 CSV）：

```csv
Time,channel1
0,2820
1,2884
2,2570
```

**双通道 Donor/Acceptor**（无表头，三列）：

```text
<time>  <donor>  <acceptor>
```

此时自动用 \(E = A/(D+A)\) 作为 HMM 输入。

每个输入文件可产出：

| 文件 | 说明 |
| --- | --- |
| `*_classified.csv` | 主输出：`time, classified_mean` 理想化轨迹 |
| `*_summary.json` | 态均值、转移矩阵、dwell、裁剪元数据、BIC 候选等 |
| `*report.dat` | 模型参数（兼容后续 TDP） |
| `*path.dat` | 每帧 raw + FRET + classified |
| `*dwell.dat` | 每段 dwell：start/stop mean、持续帧数 |

CLI 成功跑完还会写 `frethmm_run_manifest_*.json`：命令、参数、版本与依赖信息，方便复现，不拷实验原始数据。

##### 4. 近期重点更新

###### 4.1 算法加固（v1.2）：multi-start + BIC

Baum-Welch 对初值敏感，一次拟合容易掉进差的局部最优。

- **`--n-init`（默认 10）**：确定性多起点，保留 log-likelihood 最高的一次；start 0 就是旧版均匀初值，所以 `--n-init 1` 可字节级复现旧行为  
- **`--states auto`**：在 `[min-states, max-states]`（默认 2–6）扫一遍，每个候选都 multi-start，再按 **BIC** 选态数；`summary.json` 里会留下 `model_candidates` 表可审计  

```bash
frethmm run --files trace.csv --states 3              # 默认 10 starts
frethmm run --files trace.csv --states 3 --n-init 1   # 旧行为
frethmm run --input-dir ./traces/ --states auto --min-states 2 --max-states 5
```

###### 4.2 动力学闭环（v1.3–v1.4）：events + dwell-stats

分类只是半程。v1.3 把 ON/OFF 抽进包内，v1.4 再加 dwell 分位数与单指数速率拟合。下游纯消费 `*_classified.csv` / `event_details.csv`，不改上游 `run` 语义，回归压力小。

###### 4.3 批次审查与低态窗口（v1.5）

真实分析很少「一键出图完事」，而是：

1. 多文件夹原始轨迹 → 各自 `<folder>_output`  
2. 每文件夹出 Review Grid  
3. 人工删掉不合格的 `*_classified.csv`  
4. 对审查后的目录跑 ON/OFF → `<folder>_output_ONOFF`  

低态窗口过滤从「只砍末尾」改成 **从 0 s 向前找首次持续最低态窗口**，保留到该窗口结束再二次拟合，避免漂白后噪声污染前面状态。

###### 4.4 Windows GUI 真并行（v1.6，当前）

Windows 上以前 worker 数开大不一定真加速。v1.6 用 **spawn 兼容进程池** 做文件级并行；取消后不再调度新任务，进行中的文件可写完 `*_classified.csv`，取消的 Review Grid **不写出半截 PNG**。

##### 5. 开发路径与体会

| 阶段 | 解决什么 | 收获 |
| --- | --- | --- |
| v0.1–v0.3 | 能跑的 HMM + CLI/GUI 骨架 | 模块化 `core/domain/app/viz`，先对齐 HaMMy 心智 |
| v0.4–v1.0 | 可批处理、可审查 | CustomTkinter；Review Grid 把「分类」和「质控」拆开 |
| v1.2 | 拟合不稳、态数靠猜 | multi-start + BIC；`--n-init 1` 保旧结果可复现 |
| v1.3–v1.4 | 分类后还要动力学 | events / dwell-stats 纯下游扩展 |
| v1.5 | 多文件夹人工审查闭环 | 版本化输出目录 + 低态窗口二次拟合 |
| v1.6 | Windows 批量慢、取消不安全 | 真进程池 + 取消语义写清楚 |

几点踩坑后的原则：

**1）分类和审查要分开**

自动拟合总会有坏轨迹。先 Review Grid 扫一遍，再决定全量导出，比事后在 Excel 里翻分类结果省事。

**2）可复现比「多几个开关」重要**

multi-start 用固定 seed；`--n-init 1` 对齐旧版；每次 run 写 manifest。单分子文章最怕「同样输入跑出不一样」。

**3）下游分析尽量不污染上游**

`events` / `dwell-stats` 只读 classified / event_details，不改 `run` 默认输出。功能可以长，回归边界要短。

**4）漂白/失活不能当 OFF**

末尾不可恢复低态若算进 OFF，dwell 和 \(k\) 会被系统性拉歪。事件定义里单独处理，比事后人工删更稳。

**5）GUI 并行要写清语义**

取消是「不再调度」还是「立刻杀进程」？半截图写不写？v1.6 把这些钉死，批量实验才敢开 workers=2/4。

项目结构（核心）：

```text
FretHMM/
├── frethmm/
│   ├── app/          # cli / gui / i18n
│   ├── core/         # model / batch / events / dwell_stats / io
│   ├── domain/       # Config / Trace / Result
│   ├── formats/      # report / classified 解析
│   └── viz/          # review_grid / tdp
├── tests/
├── build_exe.py
└── README.md / README_zh.md
```

##### 6. 小结

[FretHMM](https://github.com/Caizhaohui/FretHMM) 更适合：

- smFRET / 单分子荧光时间轨迹的 HMM 状态分类  
- 需要 **批量 + 人工 Review Grid 质控** 的分析流程  
- 分类之后还要 **ON/OFF、dwell 分布与速率常数** 的下游统计  
- 希望 Windows 有 EXE、中英文 GUI，同时 CLI 可脚本化复现  

最近重心在 **算法加固（multi-start / BIC）**、**动力学闭环（events / dwell-stats）**、**批次审查与低态过滤（v1.5）** 以及 **Windows 真并行与取消安全（v1.6）**。后面如果继续改，大概会优先：更友好的 TDP 批处理报告、更细的拟合 warning 分类，以及与上游轨迹导出流程更紧的衔接。

欢迎 Issue / PR。仓库：[https://github.com/Caizhaohui/FretHMM](https://github.com/Caizhaohui/FretHMM)
