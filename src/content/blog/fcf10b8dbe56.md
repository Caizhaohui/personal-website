---
title: 「数据整理」将含有两列数据的table转为二进制矩阵数据
description: 1. 修改的需求 2.在R中实现目的
pubDate: 2020-07-21T02:41:01.000Z
tags: []
lang: zh
draft: false
source: 'https://www.jianshu.com/p/fcf10b8dbe56'
---
##### 1\. 修改的需求

```
#例如你用以下table
dt = data.table(id = c('id1','id2','id3','id4','id5','id6'), sample = c("MER-1,MER-3,MER-4","MER-5","MER-2","MER-2,MER-3,MER-4,MER-5","MER_3","MER-5" ))

dt
    id                  sample
1: id1       MER-1,MER-3,MER-4
2: id2                   MER-5
3: id3                   MER-2
4: id4 MER-2,MER-3,MER-4,MER-5
5: id5                   MER_3
6: id6                   MER-5

#你要转化为以下矩阵
MER-1 MER-2 MER-3 MER-4 MER-5
id1     1     0     0     1     0
id2     0     0     0     1     0
id3     1     0     0     0     0
id4     1     1     0     0     0
id5     0     0     1     1     0
id6     0     1     1     0     1
```

##### 2.在R中实现目的

```
table(dt[,unlist(strsplit(sample,",")),by=id])
     V1
id    MER-1 MER-2 MER-3 MER-4 MER-5 MER_3
  id1     1     0     1     1     0     0
  id2     0     0     0     0     1     0
  id3     0     1     0     0     0     0
  id4     0     1     1     1     1     0
  id5     0     0     0     0     0     1
  id6     0     0     0     0     1     0
```
