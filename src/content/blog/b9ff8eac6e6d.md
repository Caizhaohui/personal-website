---
title: 使用ggord包进行PCA分析和作图
description: >-
  PCA（Principal Component Analysis）主成分分析，
  用来考察多个变量间相关性一种多元统计方法，研究如何通过少数几个主成分来揭示多个变量间的内部结构...
pubDate: 2018-12-31T10:50:56.000Z
tags: []
lang: zh
draft: false
source: 'https://www.jianshu.com/p/b9ff8eac6e6d'
---
PCA（Principal Component Analysis）主成分分析， 用来考察多个变量间相关性一种多元统计方法，研究如何通过少数几个主成分来揭示多个变量间的内部结构，即从原始变量中导出少数几个主成分，使它们尽可能多地保留原始变量的信息，且彼此间互不相关.通常数学上的处理就是将原来P个指标作线性组合作为新的综合指标。上述解释来自[主成分分析的百度百科](https://baike.baidu.com/item/%E4%B8%BB%E6%88%90%E5%88%86%E5%88%86%E6%9E%90/829840?fr=aladdin)。我数学不好，这个解释看得云里雾里。  
我理解的PCA分析就是一种降维思想的体现，比如你区分两个人，你可以根据人的眼耳口鼻等五官，发型发量发色等头发，还有体重身高等十几个甚至上百个特征来描述和区分这两个人。 PCA分析将这些特征进行组合形成新的特征指标，从而以两三个特征指标来区分这两个人。感觉举得这个例子很失败，算了不解释了，直接分析作图吧！

1.  ggord的介绍和安装  
    ggord是基于ggplot2的对数据集进行聚类分析作图的R包,提供了多种聚类方法，比如主成分分析的不同算法，非度量多维尺度分析法， 多元对应分析，一致性分析以及线性判别分析。

```
install.packages('devtools')
library(devtools)
install_github('fawda123/ggord')
library(ggord)
##  [1] ggord.acm      ggord.ca       ggord.cca      ggord.coa     
##  [5] ggord.default  ggord.dpcoa    ggord.lda      ggord.mca     
##  [9] ggord.MCA      ggord.metaMDS  ggord.pca      ggord.PCA     
## [13] ggord.ppca     ggord.prcomp   ggord.princomp ggord.rda     
## see '?methods' for accessing help and source code
```

---

2.  示例数据集iris的介绍  
    了解iris数据集的结构有利于对分析过程的理解以及模仿该方法处理自己的数据。

```
  Sepal.Length Sepal.Width Petal.Length Petal.Width Species
1          5.1         3.5          1.4         0.2  setosa
2          4.9         3.0          1.4         0.2  setosa
3          4.7         3.2          1.3         0.2  setosa
4          4.6         3.1          1.5         0.2  setosa
5          5.0         3.6          1.4         0.2  setosa
6          5.4         3.9          1.7         0.4  setosa
```

---

鸢尾花(iris)数据包包含三个鸢尾花种之一（setosa,versicolour或virginica)。每个花的特征用下面的4种属性描述萼片长度(Sepal.Length)、萼片宽度(Sepal.Width)、花瓣长度(Petal.Length)、花瓣宽度(Petal.Width)。

3.  分析画图  
    简单的自动出图。

```
# 取iris数据集里的1到4列的所有行的数据，命名为ord
ord <- prcomp(iris[, 1:4])
#ord是观察值，iris$Species意思是以iris数据集里的鸢尾花种类为变量
p <- ggord(ord, iris$Species)
p
```

---

![](/images/posts/b9ff8eac6e6d/10821116-da80c12c2dc00be9.png)

指定不同类群的背景颜色。

```
p <- ggord(ord, iris$Species, cols = c('purple', 'orange', 'blue'))
p
```

---

![](/images/posts/b9ff8eac6e6d/10821116-c3b8b98c972af95b.png)

改变不同类群的形状。

```
library(ggplot2)
p + scale_shape_manual('Groups', values = c(1, 2, 3))
```

---

![](/images/posts/b9ff8eac6e6d/10821116-5ee16c62aea09c3b.png)

换主题背景，不要背景线和上右边线。

```
p + theme_classic()
```

---

![](/images/posts/b9ff8eac6e6d/10821116-f5325f3605e13a40.png)

将图例放在图的上面。

```
p + theme(legend.position = 'top')
```

---

![](/images/posts/b9ff8eac6e6d/10821116-3cd9713328691a46.png)

将不同类群的椭圆背景换成椭圆圈。

```
p <- ggord(ord, iris$Species, poly = FALSE)
p
```

---

![](/images/posts/b9ff8eac6e6d/10821116-68c7c37dee7b5fff.png)

改变不同类群的椭圆圈线性

```
p <- ggord(ord, iris$Species, poly = FALSE, polylntyp = iris$Species)
p
```

---

![](/images/posts/b9ff8eac6e6d/10821116-3605b7f37eb139e7.png)

改变不同类群的背景形状

```
p <- ggord(ord, iris$Species, ellipse = FALSE, hull = TRUE)
p
```

---

![](/images/posts/b9ff8eac6e6d/10821116-86ee586da23389bf.png)

改变向量标签

```
new_lab <- list(Sepal.Length = 'SL', Sepal.Width = 'SW', Petal.Width = 'PW',
  Petal.Length = 'PL')
p <- ggord(ord, iris$Species, vec_lab = new_lab)
p
```

---

![](/images/posts/b9ff8eac6e6d/10821116-5ed7945ea27625ec.png)

将每个数据点的值显示出来。

```
p <- ggord(ord, iris$Species, obslab = TRUE)
p
```

---

![](/images/posts/b9ff8eac6e6d/10821116-a25b33fc13225f0a.png)

将萼片的长度通过数据点的大小显示在图上。

```
p <- ggord(ord, grp_in = iris$Species, size = iris$Sepal.Length, sizelab = 'Sepal\nlength')
p
```

---

![](/images/posts/b9ff8eac6e6d/10821116-20bca032c9093a57.png)

不同类群分面展示

```
p <- ggord(ord, iris$Species, facet = TRUE, nfac = 1)
p
```

---

![](/images/posts/b9ff8eac6e6d/10821116-edd1b88d72b83e77.png)

多元对应分析

```
data(tea, package = 'FactoMineR')
tea <- tea[, c('Tea', 'sugar', 'price', 'age_Q', 'sex')]

ord <- MCA(tea[, -1], graph = FALSE)

ggord(ord, tea$Tea)
```

---

![](/images/posts/b9ff8eac6e6d/10821116-6cc4a66023a4762d.png)

非度量多维尺度分析法

```
library(vegan)
ord <- metaMDS(iris[, 1:4])

ggord(ord, iris$Species)
```

---

![](/images/posts/b9ff8eac6e6d/10821116-d78765326609a35f.png)

线性判别分析

```
library("MASS")
ord <- lda(Species ~ ., iris, prior = rep(1, 3)/3)

ggord(ord, iris$Species)
```

---

![](/images/posts/b9ff8eac6e6d/10821116-7503679537467a19.png)
