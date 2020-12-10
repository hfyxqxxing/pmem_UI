#!/bin/bash


ssh root@10.239.85.78 killall -9 fio
sleep 2
killall -9 fio
killall -9 rpma_fio_sh
rm -rf /home/xiaoran/fio/examples/read_results/result.log
/home/xiaoran/fio/examples/read_results/./rpma_fio_sh




