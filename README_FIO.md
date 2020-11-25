
---
title: Installation of RPMA FIO  
author:    me  
layout: post  
identifier: librpma(?)  
---

# Introduction

This document is about installing the ***rpma*** and its special ***fio*** for testing rpma's performance.

## RPMA

The **Remote Persistent Memory Access (RPMA)** is a C library to simplify accessing persistent memory on remote hosts over **Remote Direct Memory Access (RDMA)**. For more information, see [pmem.io](https://pmem.io).    

[Persistent Memory Over Traditional RDMA White Paper - Part 1](https://software.intel.com/content/www/us/en/develop/articles/persistent-memory-replication-over-traditional-rdma-part-1-understanding-remote-persistent.html) - which also describes a technology behind RPMA.  

#### Note:
 * **Direct memory access** means transmitting information from server computer to client computer ***without passing through CPUs.*** 
 * [**Persistent Memory**](https://www.intel.com/content/www/us/en/architecture-and-technology/optane-dc-persistent-memory.html) (pmem) is a new-tech device developed by Intel.


## FIO

[Flexible IO tester](https://github.com/pmem/fio) (FIO) is an open-source synthetic benchmark tool. It can easily and quickly test most I/O performances cases with widely customized parameters. The fio we use here is specially developed for pmem tests.


## Before Start
 ***Please install the mellanox drivers and pmem drivers correctly before this installation.*** Their installation will not be mentioned here.

# Environment

* **System:** Fedora 31  
* **Kernel:** 5.3.7-301.fc31.x86_64  
* **Hardware:** pmem, RNIC  
* **Softwares:** rpma, fio, ipmctl, ndctl ... (Enough softwares to support pmem and RNIC)  

# Requirements

Please go to [RPMA](https://github.com/pmem/rpma/blob/master/INSTALL.md)  and [PMEM/FIO](https://github.com/pmem/fio) to get the latest version of installation.

**rpma:**

```
$ yum -y install cmake pkg-config libibverbs-devel librdmacm-devel libcmocka-devel libpmem-devel libprotobuf-c-devel;
$ git clone https://github.com/pmem/rpma;
$ cd rpma && mkdir build && cd build;
$ cmake ..;
$ make -j$(nproc);
$ make install;
```
**fio:**

```
$ git clone https://github.com/pmem/fio;
$ cd fio && ./configure;
$ make;
$ make install;
```

***Note:***  if your kernel version or system version is too low, you may not have or support **cmake**. You should manually compile cmake package or update your versions. 


***Check** the configuration of fio engines in case that the fio fails. 

In the directory of fio : 

```	
$./configure | grep librpma;
...
librpma                 yes 
...
```

***Note:*** If the librpma in fio configure is 'no', it means the rpma's path is not detected by the fio. You should try either the two ways below:
* Add ***prefix=/usr/local*** after the $make install of the **rpma**  

```
$ make install prefix=/usr/local
```

* Add ***pkgs_path*** to the ~/.bashrc file.
```
$ export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/lib64/;
$ source ~/.bashrc;
```

# Fio Test

**Before** testing the real cases' performance, you may first test the max bind width of the transaction:

On **server** machine : 
```	
$ numactl -N 1 ib_read_bw -a -d mlx5_0 -p 999;
# -N [number] should be the cpu where your RNIC is .
```
On **client** machine :  
```
$ numactl -N 1 ib_read_bw -a -F 192.168.0.1 -d mlx5_0 -p 999;
# 192.168.0.1 should be the virtual address of server.
```  

## Fio commands to test the rpma : 

On the **server**( listener ) server, in the fio directory:

```
$ cd examples;  
$ fio librpma-server.fio;
# check the librpma-server.fio and fill in the blanks
```

On the **client**( sender ) server, in the fio directory:

```	
$ cd examples; 
$ fio librpma-client.fio;
# check the librpma-client.fio and fill in the parameters.
```

***Note:*** if there is something wrong with the send-receive process, the listening process can't be interrupted by `Ctrl+C`. You should use **kill** to finish it before next try.

### Test features in fio
 
 * BW: bind width
 * lat: latency
 * clat: complete latency(ignore the latency of submit and receive)
 * numjobs: number of threads
 * rw: read or write or random read/write
 * iodepth, blocksize, size, time_based, sync, ... 


## Possible improvements

*You may also control the fio arguments by command line:
e.g.
```
$ vim librpma-client.fio;
>>iodepth=${depth}
$ depth=8 fio librpma-client.fio;
```

*You may also use `numactl` to improve performance:
	
```
$ cat /sys/class/net/enp24s0f0/device/numa_node;
0     
#This is the value for $RNIC_NUMA

$ numactl -N $RNIC_NUMA ./benchmark args;
# e.g. numactl -N 0 depth=8 fio librpma-client.fio
```
