---
title: 使用anvi'o进行宏基因组的组装和分箱
description: >-
  这部分教程来自Happy Belly Bioinformatics网站,
  主要比较宏基因组的单样品组装和多样品联合组装这两种组装策略以及宏基因组数据的可视化。 教程简介 一般...
pubDate: 2019-01-07T13:16:53.000Z
tags: []
lang: zh
draft: false
source: 'https://www.jianshu.com/p/6d4bdbd08fe6'
---
这部分教程来自[Happy Belly Bioinformatics网站](https://astrobiomike.github.io/genomics/metagen_anvio), 主要比较宏基因组的单样品组装和多样品联合组装这两种组装策略以及宏基因组数据的可视化。

1.  教程简介

一般的宏基因组分析流程

  

![](/images/posts/6d4bdbd08fe6/10821116-e9573af748c20689.webp)

metagen\_overview.png

2.  软件安装

```
conda install -y bowtie2 anvio diamond
```

---

3.  示例数据的下载

```
#创建名为Happy_Belly_Bioinformatics的文件夹并进入该文件夹
(anvio) czh@ubuntu:~/Desktop$ mkdir Happy_Belly_Bioinformatics
(anvio) czh@ubuntu:~/Desktop$ cd Happy_Belly_Bioinformatics/
#下载数据
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics$ curl -L https://ndownloader.figshare.com/files/12389045 -o metagen_tut.tar.gz
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics$ ls
metagen_tut.tar.gz
#数据解压
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics$ tar -xzvf metagen_tut.tar.gz
metagen_tut/
metagen_tut/results/
metagen_tut/results/Sample_D.bam
metagen_tut/results/Sample_B.bam
metagen_tut/results/Sample_D.bam.bai
metagen_tut/results/Sample_A.bam.bai
metagen_tut/results/megahit_default/
metagen_tut/results/megahit_default/final.contigs.fa
metagen_tut/results/contigs.db
metagen_tut/results/centrifuge_report.tsv
metagen_tut/results/Sample_B.bam.bai
metagen_tut/results/Sample_C.bam
metagen_tut/results/merged_profile/
metagen_tut/results/merged_profile/PROFILE.db
metagen_tut/results/merged_profile/RUNLOG.txt
metagen_tut/results/merged_profile/AUXILIARY-DATA.db
metagen_tut/results/centrifuge_hits.tsv
metagen_tut/results/Sample_A.bam
metagen_tut/results/Sample_C.bam.bai
metagen_tut/working/
metagen_tut/data/
metagen_tut/data/Sample_A_2.fastq.gz
metagen_tut/data/Sample_D_1.fastq.gz
metagen_tut/data/Sample_B_1.fastq.gz
metagen_tut/data/Sample_C_1.fastq.gz
metagen_tut/data/Sample_C_2.fastq.gz
metagen_tut/data/Sample_D_2.fastq.gz
metagen_tut/data/Sample_A_1.fastq.gz
metagen_tut/data/Sample_B_2.fastq.gz
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics$ ls
metagen_tut  metagen_tut.tar.gz
#查看metagen_tut文件夹中的内容
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics$ cd metagen_tut/
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics/metagen_tut$ ls
data  results  working
#获得四个样品名并存入samples.txt中
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics/metagen_tut/working$ ls ../data/*.gz | cut -f3 -d "/" | cut -d "_" -f1,2 | uniq > samples.txt
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics/metagen_tut/working$ cat samples.txt 
Sample_A
Sample_B
Sample_C
Sample_D
```

---

4.  Co-assembly 多样品联合组装  
    教程的作者已经使用megahit软件进行了组装。结果文件存放在megahit\_default文件夹中。

```
## don't run this, would take about 40+ minutes ##
# megahit -1 ../data/Sample_A_1.fastq.gz,../data/Sample_B_1.fastq.gz,../data/Sample_C_1.fastq.gz,../data/Sample_D_1.fastq.gz \
# -2 ../data/Sample_A_2.fastq.gz,../data/Sample_B_2.fastq.gz,../data/Sample_C_2.fastq.gz,../data/Sample_D_2.fastq.gz \
# -o megahit_default -t 4

#将结果文件final.contigs.fa复制到当前路径。
cp ../results/megahit_default/final.contigs.fa .
#将组装好的基因组fasta文件格式的转化。
anvi-script-reformat-fasta final.contigs.fa -o contigs.fa -l 1000 --simplify-names
```

---

5.  原始reads与Co-assembly的基因组的比对

```
# Co-assembly的基因组构建索引
bowtie2-build contigs.fa assembly

# 比对
## do not run, takes a bit ##
# bowtie2 -x assembly -q -1 ../data/Sample_A_1.fastq.gz \
# -2 ../data/Sample_A_2.fastq.gz --no-unal \
# -p 4 -S Sample_A.sam

# sam文件转换为bam文件
## do not run, takes a bit ##
# samtools view -b -o Sample_A-raw.bam Sample_A.sam

# bam文件的排序和索引
## do not run, takes a bit ##
# for sample in $(cat samples.txt)
# do
#   bowtie2 -x assembly -q -1 ../data/"$sample"_1.fastq.gz -2 ../data/"$sample"_2.fastq.gz --no-unal -p 4 -S "$sample".sam
#   samtools view -b -o "$sample"-raw.bam "$sample".sam
#   samtools sort -o "$sample".bam "$sample"-raw.bam
#   samtools index "$sample".bam
# done

#将bam结果文件复制到当前工作目录
cp ../results/*.bam* .
```

---

6.  使用anvi’o构建contigs数据库

```
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics/metagen_tut/working$ anvi-gen-contigs-database -f contigs.fa -o contigs.db -n "my metagenome"
Input FASTA file .............................: /home/czh/Desktop/Happy_Belly_Bioinformatics/metagen_tut/working/contigs.fa
Name .........................................: my metagenome
Description ..................................: No description is given
Split Length .................................: 20,000                          
K-mer size ...................................: 4
Skip gene calling? ...........................: False
External gene calls provided? ................: None
Ignoring internal stop codons? ...............: False
Splitting pays attention to gene calls? ......: True

Finding ORFs in contigs
===============================================
Genes ........................................: /tmp/tmpmkhku_j8/contigs.genes
Amino acid sequences .........................: /tmp/tmpmkhku_j8/contigs.amino_acid_sequences
Log file .....................................: /tmp/tmpmkhku_j8/00_log.txt
Result .......................................: Prodigal (v2.6.3) has identified 36364 genes.

Contigs with at least one gene call ..........: 2998 of 3006 (99.7%)            
Contigs database .............................: A new database, contigs.db, has been created.
Number of contigs ............................: 3,006
Number of splits .............................: 4,049
Total number of nucleotides ..................: 43,773,494
Gene calling step skipped ....................: False
Splits broke genes (non-mindful mode) ........: False
Desired split length (what the user wanted) ..: 20,000
Average split length (wnat anvi'o gave back) .: 21,991
```

---

7.  使用hmmer扫描contigs数据库中的单拷贝基因

```
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics/metagen_tut/working$ anvi-run-hmms -c contigs.db -I Campbell_et_al -T 12
Target found .................................: AA:GENE                         
Contigs DB ...................................: Initialized: contigs.db (v. 12) 

WARNING
===============================================
You did not provide any gene caller ids. As a result, anvi'o will give you back
sequences for every 36364 gene call stored in the contigs database. Brace
yourself.

Output .......................................: /tmp/tmpz3roc5jd/AA_gene_sequences.fa

HMM Profiling for Campbell_et_al
===============================================
Reference ....................................: Campbell et al, http://www.pnas.org/content/110/14/5540.short
Kind .........................................: singlecopy
Alphabet .....................................: AA
Context ......................................: GENE
Domain .......................................: bacteria
HMM model path ...............................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/hmm/Campbell_et_al/genes.hmm.gz
Number of genes ..............................: 139
Noise cutoff term(s) .........................: --cut_ga
Number of CPUs will be used for search .......: 12
Temporary work dir ...........................: /tmp/tmp2howc33n
HMM scan output ..............................: /tmp/tmp2howc33n/hmm.output
HMM scan hits ................................: /tmp/tmp2howc33n/hmm.hits
Log file .....................................: /tmp/tmp2howc33n/00_log.txt
Number of raw hits ...........................: 920 
```

---

8.  使用COGs对contigs数据库进行注释

```
#设置anvi’o COG 数据库
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics/metagen_tut/working$ anvi-setup-ncbi-cogs -T 8 --just-do-it
COG data directory ...........................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG
COG data source ..............................: The anvi'o default.
COG data dir .................................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG

WARNING
===============================================
This program will first check whether you have all the raw files, and then will
attempt to regenerate everything that is necessary from them.

Downloaded succesfully .......................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG/RAW_DATA_FROM_NCBI/cog2003-2014.csv
Downloaded succesfully .......................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG/RAW_DATA_FROM_NCBI/cognames2003-2014.tab
Downloaded succesfully .......................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG/RAW_DATA_FROM_NCBI/fun2003-2014.tab
Downloaded succesfully .......................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG/RAW_DATA_FROM_NCBI/prot2003-2014.fa.gz
Diamond log ..................................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG/DB_DIAMOND/log.txt
Diamond search db ............................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG/DB_DIAMOND/COG.dmnd
BLAST log ....................................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG/DB_BLAST/log.txt
BLAST search db ..............................: /tmp/tmpt4qy3r3c     

#注释
(anvio) czh@ubuntu:~/Desktop/Happy_Belly_Bioinformatics/metagen_tut/working$ anvi-run-ncbi-cogs -c contigs.db  -T 12
COG data directory ...........................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG
COG data source ..............................: The anvi'o default.
COG data directory ...........................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG
Searching with ...............................: diamond
Directory to store temporary files ...........: /tmp/tmpef3uia0u
Directory will be removed after the run ......: True
Sequences ....................................: 36364 sequences reported.        
FASTA ........................................: /tmp/tmpef3uia0u/aa_sequences.fa
DIAMOND is set to be .........................: Fast
Diamond blastp results .......................: /tmp/tmpef3uia0u/diamond-search-results.daa
Diamond tabular output file ..................: /tmp/tmpef3uia0u/diamond-search-results.txt
COG data directory ...........................: /home/czh/miniconda3/envs/anvio/lib/python3.6/site-packages/anvio/data/misc/COG
COG data source ..............................: The anvi'o default.
Gene functions ...............................: 49442 function calls from 2 sources for 24721 unique gene calls has been added to the contigs database.
```

---

9.  使用Centrifuge对contigs数据库进行物种分类

```
## do not run, takes a bit and a database setup ##
# anvi-get-sequences-for-gene-calls -c contigs.db -o gene_calls.fa
# centrifuge -f -x /media/eclipse/centrifuge_db/nt/nt gene_calls.fa -S centrifuge_hits.tsv -p 20

# 将contigs数据库物种分类结果复制到当前工作目录
cp ../results/*tsv .

# 将contigs数据库物种分类信息导入到contigs.db文件中
anvi-import-taxonomy-for-genes -c contigs.db -i centrifuge_report.tsv centrifuge_hits.tsv -p centrifuge

```

---

10.  单个样品信息导入到contigs数据库  
     前面的分析已经使contigs数据库包含多样品联合组装相关的各种信息了，我们现在要将把每个样品信息导入整合到contigs数据库。

```
## do not run, takes a bit ##
# for i in $(cat samples.txt)
# do 
#   anvi-profile -i "$i".bam -c contigs.db -T 4
# done

## do not run ##
# anvi-merge */PROFILE.db -o merged_profile -c contigs.db

#将上述操作的结果复制到当前工作目录
cp -r ../results/merged_profile/ .
```

---

11.  结果可视化

```
anvi-interactive -p merged_profile/PROFILE.db -c contigs.db
```

---

![](/images/posts/6d4bdbd08fe6/10821116-a793cfca589c330e.webp)
