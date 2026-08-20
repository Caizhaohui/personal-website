---
title: 使用python处理生物信息数据（二）
description: >-
  Python学习的第二天。 1.处理数据列 处理ImageJ测量神经树突长度获得的数据。 output.write("total dendritic
  length      ...
pubDate: 2020-02-29T15:06:53.000Z
tags: []
lang: zh
draft: false
source: 'https://www.jianshu.com/p/acbab1777bc1'
---
> Python学习的第二天。

##### 1.处理数据列

处理ImageJ测量神经树突长度获得的数据。

```
data = []

#读取neuron_data.txt文件，strip()函数去除文件中每行起始位置的空格和末尾的换行符。
for line in open('neuron_data.txt'):
    length = float(line.strip())
    data.append(length)

#data数据的长度
n_items = len(data)
#data数据的求和
total = sum(data)
#data数据中最大值
shortest = min(data)
#data数据中最小值
longest = max(data)

#data数据排序
data.sort()

#写入results.txt文件
output = open("results.txt","w")
output.write("number of dendritic lengths : %4i \n"%(n_items))
output.write("total dendritic length      : %6.1f \n"%(total))
output.write("shortest dendritic length   : %7.2f \n"%(shortest))
output.write("longest dendritic length    : %7.2f \n"%(longest))
output.write("%37.2f\n%37.2f"%(data[-2], data[-3]))
output.close()

##自己创建一个文件并写入内容
f = open("czh_test.txt", "w")

f.write("Hello! My name is czh.")
Out[15]: 22

f.close()

g = open("czh_test.txt")

g.read()
Out[18]: 'Hello! My name is czh.'
```

---

> output.write("total dendritic length : %6.1f \\n"%(total))中%6.1f \\n"%(total)的含义，%x.yf中x表示插入的字符串总的字符数，y表示小数位数，f表示浮点数， %4i 中i表示整数。这样的操作是将输入的数格式化，有利于后面的数据处理和计算。

```
'%8.3f' % (12.3456) #整个字符串的字符数为8，小数位数为3，12.3456有7个字符，4位小数。
Out[21]: '  12.346'
```

> %s 表示简单的插入一个字符串,%50s中间的数字表示插入的位置。

```
name = 'E.coli'
'Hello, %s' % (name)
Out[22]: 'Hello, E.coli'

#%50s中的数字50表示插入的位置，%10s则表示右对齐插入，%-10s则表示左对齐插入。
'Hello, %50s' % (name)
Out[23]: 'Hello,                                             E.coli'
```

---

##### 2.将数据列写入到一个文本文件

```
data = [16.38, 139.90, 441.46, 29.03, 40.93, 202.07, 142.30, 346.00, 300.00]

out = []

for value in data:
    out.append(str(value) + '\n')
    
open("results.txt", "w").writelines(out)

#使用join()将多个字符连成一行字符串
L = ['1', '2', '3', '4']
"+".join(L)
Out[30]: '1+2+3+4'
```

---

##### 3.计算平均值

```
data = [3.53, 3.47, 3.51, 3.72, 3.43]

average  = sum(data) / len(data)

average
Out[33]: 3.532
```

---

##### 4.计算标准差

```
#载入math模块
import math

data = [3.53, 3.47, 3.51, 3.72, 3.43]
#求data数据的平均值
average = sum(data) / len(data)

#
total = 0.0
for value in data:
    total += (value - average) ** 2 #求方差
stddev = math.sqrt(total / len(data))  #方差的算术平方根

print(stddev)
0.10008396474960415
```

---

##### 5.计算中值

```
data = [3.53, 3.47, 3.51, 3.72, 3.43]

data.sort() #将data升序排列
mid = len(data) // 2  #将data进行地板除（除了以后向下取整）
#
if len(data) % 2 == 0:  #求data长度除以2后的余数，如果等于0，则data长度是偶数。
    median = (data[mid - 1] + data[mid]) // 2.0 
else:
    median = data[mid]

print(median)
3.51
```

---
