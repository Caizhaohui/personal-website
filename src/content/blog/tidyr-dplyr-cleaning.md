---
title: 使用 tidyr 和 dplyr 进行数据清洗
description: 扩增子数据处理中常用的 R 数据清洗套路：长宽转换、分组汇总、列选择与缺失值处理。
pubDate: 2024-05-10
tags:
  - R
  - 数据清洗
  - tidyverse
lang: zh
draft: false
source: https://www.jianshu.com/u/36f606498ed2
---

最近在处理扩增子（amplicon）数据时，频繁需要把原始表格整理成 tidy 格式以便下游分析。这里记录一下常用的 `tidyr` + `dplyr` 组合拳。

## 加载包

```r
library(dplyr)
library(tidyr)
library(readr)
```

## 长宽格式互转

`pivot_longer` 把宽表转长表：

```r
long <- wide %>%
  pivot_longer(
    cols = starts_with('sample'),
    names_to = 'sample',
    values_to = 'count'
  )
```

反过来用 `pivot_wider`：

```r
wide <- long %>%
  pivot_wider(
    names_from = sample,
    values_from = count,
    values_fill = 0
  )
```

## 分组汇总

```r
summary <- long %>%
  group_by(genus, sample) %>%
  summarise(total = sum(count), .groups = 'drop')
```

| 操作 | 函数 |
| --- | --- |
| 选择列 | `select()` |
| 过滤行 | `filter()` |
| 新增列 | `mutate()` |
| 分组汇总 | `group_by() %>% summarise()` |

> 小贴士：链式操作 `%>%` 让代码读起来像自然语言，复杂步骤也清晰。

## 缺失值处理

```r
cleaned <- df %>%
  drop_na() %>%        # 删除含 NA 的行
  replace_na(list(count = 0))
```

---

下一篇会讲怎么把这些清洗好的数据喂给 `phyloseq` 做下游分析。
