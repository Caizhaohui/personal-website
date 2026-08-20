---
title: 使用python处理生物信息数据（一）
description: >-
  趁疫情被封闭在家，学习一下python，之前尝试过看过perl的书，代码看得我一脸懵逼，python乍看上去和蔼可亲多了，再加上有个师兄鼓励和推荐学习python，找了这本书...
pubDate: 2020-02-28T16:27:52.000Z
tags: []
lang: zh
draft: false
source: 'https://www.jianshu.com/p/75dae6c88bdc'
---
> 趁疫情被封闭在家，学习一下python，之前尝试过看过perl的书，代码看得我一脸懵逼，python乍看上去和蔼可亲多了，再加上有个师兄鼓励和推荐学习python，找了这本书Managing Your Biological Data with Python先动起来吧，希望自己能坚持下去。
> 
>   
> 
> ![](/images/posts/75dae6c88bdc/10821116-51be34489f94de7f.jpg)
> 
> Managing Your Biological Data with Python

##### 1\. Anaconda安装和示例数据

在笔记本wins7上安装了anaconda，用的Spyder进行操作，  
这本书是讲的python2，我从[Library Genesis](https://links.jianshu.com/go?to=%255Bhttp%3A%2F%2Fgen.lib.rus.ec%2F%255D%28http%3A%2F%2Fgen.lib.rus.ec%2F%29)搜索下载的英文版，在github上[Managing Your Biological Data with Python 3](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fraymonwu%2FManaging_Your_Biological_Data_with_Python_3) 将书中的示例代码转化为了python3，并提供了示例数据。

##### 2\. 一个简单示例，计算ATP的吉布斯自由能

计算ATP的吉布斯自由能，包含了一些基础操作：模块载入，简单的数学计算和查看模块中包含的函数功能和帮助。自己的理解：python模块载入import类似于R语言中library()载入所需的R包，然后可以工作。

```
#已知数据
ATP = 3.5
ADP = 1.8
Pi = 5.0
R = 0.00831
T = 298
deltaG0 = -30.5
#载入math模块
import math
#计算
print (deltaG0 + R * T * math.log(ADP * Pi / ATP))
-28.161154161098693
#查看math模块中的函数
dir(math)
Out[12]: 
['__doc__',
 '__loader__',
 '__name__',
 '__package__',
 '__spec__',
 'acos',
 'acosh',
 'asin',
 'asinh',
 'atan',
 'atan2',
 'atanh',
 'ceil',
 'copysign',
 'cos',
 'cosh',
 'degrees',
 'e',
 'erf',
 'erfc',
 'exp',
 'expm1',
 'fabs',
 'factorial',
 'floor',
 'fmod',
 'frexp',
 'fsum',
 'gamma',
 'gcd',
 'hypot',
 'inf',
 'isclose',
 'isfinite',
 'isinf',
 'isnan',
 'ldexp',
 'lgamma',
 'log',
 'log10',
 'log1p',
 'log2',
 'modf',
 'nan',
 'pi',
 'pow',
 'radians',
 'remainder',
 'sin',
 'sinh',
 'sqrt',
 'tan',
 'tanh',
 'tau',
 'trunc']

#查看math模块使用的帮助
 help(math)
Help on built-in module math:

NAME
    math

DESCRIPTION
    This module provides access to the mathematical functions
    defined by the C standard.

FUNCTIONS
    acos(x, /)
        Return the arc cosine (measured in radians) of x.
    
    acosh(x, /)
        Return the inverse hyperbolic cosine of x.
    
    asin(x, /)
        Return the arc sine (measured in radians) of x.
    
    asinh(x, /)
        Return the inverse hyperbolic sine of x.
    
    atan(x, /)
        Return the arc tangent (measured in radians) of x.
...........

#查看math模块中sqrt函数的帮助
help(math.sqrt)
Help on built-in function sqrt in module math:

sqrt(x, /)
    Return the square root of x.
```

##### 3\. 常用的数学计算符号以及math模块中的函数功能

数学计算符号

| Operator | Meaning |
| --- | --- |
| a + b | addition |
| a – b | subtraction |
| a \* b | multiplication |
| a/b | division |
| a \*\* b | power (ab) |
| a % b | modulo: the remainder of the division a / b |
| a // b | floor division, rounds down |
| a \* (b + c) | parentheses, b + c will be done before the multiplication |

---

math模块中的函数功能

| Function | Meaning |
| --- | --- |
| log(x) | natural logarithm of x (ln x) |
| log10(x) | decadic logarithm of x (log x) |
| exp(x) | natural exponent of x (ex) |
| sqrt(x) | square root of x |
| sin(x), cos(x) | sine and cosine of x (x given in radians) |
| asin(x), acos(x) | arcsin and arccos of x (result in radians) |

---

##### 4\. 简单示例，计算空间中两点的距离

```
#载入math模块
from math import *

#(x1, y1, z1)和(x2, y2, z2)两点的坐标
x1, y1, z1 = 0.1,  0.0, -0.7
x2, y2, z2 = 0.5, -1.0,  2.7

#计算每个维度上的距离
dx = x1 - x2
dy = y1 - y2
dz = z1 - z2

#每个维度上距离的平方和
dsquare = pow(dx, 2) + pow(dy, 2) + pow(dz, 2)

#开平方
distance = sqrt(dsquare)
#打印结果
print (distance)
3.566510900025402
```

---

##### 5\. 简单示例，insulin中不同氨基酸出现的频率

```
#insulin的部分氨基酸序列
insulin = "GIVEQCCTSICSLYQLENYCNFVNQHLCGSHLVEALYLVCGERGFFYTPKT"

#for循环统计20种氨基酸在insulin序列中出现的次数
for amino_acid in "ACDEFGHIKLMNPQRSTVWY":
    number = insulin.count(amino_acid)
    print (amino_acid, number)
    
A 1
C 6
D 0
E 4
F 3
G 4
H 2
I 2
K 1
L 6
M 0
N 3
P 1
Q 3
R 1
S 3
T 3
V 4
W 0
Y 4

#模仿自测
#自己的一段氨基酸序列
in_my = "SJJAKDJAKNCNZMNCNAIUEQIJDAKLMCZNBADIOEQ8RIIOOKALQZ"
for aa in "ACDEFGHIKLMNPQRSTVWY":
    number = in_my.count(aa)
    print(aa, number)
    
A 6
C 3
D 3
E 2
F 0
G 0
H 0
I 5
K 4
L 2
M 2
N 5
P 0
Q 3
R 1
S 1
T 0
V 0
W 0
Y 0
```

---

##### 6\. 字符串的简单操作

6.1 字符串索引

```
#索引
'Protein'[0]
Out[34]: 'P'

'Protein'[1]
Out[35]: 'r'

'Protein'[2]
Out[36]: 'o'

'Protein'[-1]

Out[37]: 'n'

'Protein'[-2]
Out[38]: 'i'
```

---

6.2 字符串切片

```
'Protein'[0:3]
Out[39]: 'Pro'

'Protein'[1:]
Out[40]: 'rotein'

'Protein'[1:-1]
Out[41]: 'rotei'
```

---

6.3 字符串算法

```
#两个字符串连接到一起
'Protein' + ' ' + 'degradation'
Out[42]: 'Protein degradation'

'Protein' + ' ' + 'w'
Out[46]: 'Protein w'

'Protein' + ' ' + 'f'
Out[47]: 'Protein f'

#字符串成倍增加
'Protein' * 5
Out[48]: 'ProteinProteinProteinProteinProtein'
'Protein '  * 5
Out[50]: 'Protein Protein Protein Protein Protein '
'*' * 20
Out[51]: '********************'
```

---

6.4 统计字符串长度  
使用len()函数统计字符串长度

```
len('Protein')
Out[52]: 7
len('insulin')
Out[53]: 7
```

---

6.5 统计字符串中某个字符的数量

```
'protein'.count('r')
Out[54]: 1

'insulin'.count('r')
Out[55]: 0

'insulin'.count('i')
Out[56]: 2
```

---

##### 7\. 简单示例，创建一个随机序列

```
#使用random模块创建随机序列
import random

alphabet = "ATCG"

sequence = ""

for i in range(10):
    index = random.randint(0,3)
    sequence = sequence + alphabet[index]
    

print(sequence)
GCACAAACCG
```

---

##### 8\. 简单示例，寻找一段序列的序列motifs

```
seq = "PRQTEINSEQWENCE"
#seq序列含有15字符，for循环寻找11次，以5个字符长为滑窗。
for i in range(len(seq)-4):
    print(seq[i:i+5])
PRQTE
RQTEI
QTEIN
TEINS
EINSE
INSEQ
NSEQW
SEQWE
EQWEN
QWENC
WENCE

#以3个字符长为滑窗寻找序列motifs，如果是DNA序列，这样的处理可以用来将DNA序列转化为氨基酸序列。
for i in range(len(seq)-2):
    print(seq[i:i+3])
    
PRQ
RQT
QTE
TEI
EIN
INS
NSE
SEQ
EQW
QWE
WEN
ENC
NCE
```

---
