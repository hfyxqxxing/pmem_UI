import re
import os
import time
import threading

# path="/home/xiaoran/fio/test_results/"

# a = [1,2,4,6,8]
# name = "result_"+str(12)+".log"
# condition = True
# thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/test_results/./rpma_fio_sh',))
# thread.start()
# print("yes")
# while(condition == True):
#     if (os.path.exists(path+name)):
#         f = open(path+name,'r')
#         str1 = f.readlines()[2]
#         print(str1)
#         pattern = re.compile(r'(?<=BW=)\d+\.?\d+')
#         pattern2 = re.compile('MiB/s|GiB/s')
#         # print(pattern.findall(str1))
#         # print(pattern2.findall(str1))
#         width = pattern.findall(str1)
#         unit = pattern2.findall(str1)
#         if (unit[0] == "MiB/s"):
#             width = round(float(width[0]) / 1024 ,2 )
#         else:
#             width = round(float(width[0]),2)
#         print(width)
#         condition = False
#     else:
#         print("shuile")
#         time.sleep(10)


# 读rdma测试结果


# line 2 
      # f = open(path_2+name,'r')
      # lines = f.readlines()

      # bw = lines[2].split()[3]
      # print("this is ", bw)
   
      # if (float(bw) > 20.0):
      #    width_2 = round(float(bw) / 1074 ,2 )
      # else:
      #    width_2 = round(float(bw),2)
      # print(width_2)

      # value_one["rdma"] = [a[click],width_2]

      
      # values.append(value_one)
      # condition = False

# haha = os.popen("lscpu | grep 'CPU(s):' | awk '{print $2} '").readlines()[0].split('\n')[0];
# print(haha)
# path="/home/xiaoran/fio/rdma_test_results/"

# hehe = os.popen("lscpu | grep 'Socket(s):' | awk '{print $2} '").readlines()[0].split('\n')[0]
# print(hehe)

# Threads = os.popen("lscpu | grep 'Thread(s) per core:' | awk '{print $4}'").readlines()[0].split('\n')[0];
# print(Threads)

# cores = os.popen("lscpu | grep 'Core(s) per socket:' | awk '{print $4}'").readlines()[0].split('\n')[0];
# print(cores)

# node0 = os.popen("lscpu | grep 'NUMA node0 CPU(s):' | awk '{print $4}'").readlines()[0].split('\n')[0];
# node1 = os.popen("lscpu | grep 'NUMA node1 CPU(s):' | awk '{print $4}'").readlines()[0].split('\n')[0];
# print(node0)
# print(node1)

# name = "result_"+str(1)+".log"
# f = open(path+name,'r')
# lines = f.readlines()
# print(lines[2])
# bw = lines[2].split()
# print(bw[3])


path = "/home/xiaoran/fio/examples/sync_read_results/"

a = [1,2,4,6,8]
name = "result_"+str(20)+".log"

if (os.path.exists(path+name)):
   f = open(path+name,'r')
   str1 = f.readlines()[3]
   print(str1)
   pattern = re.compile(r'(?<=avg=)\d+\.?\d+')
   pattern2 = re.compile('nsec|usec')
   # print(pattern.findall(str1))
   # print(pattern2.findall(str1))
   unit = pattern2.findall(str1)[0]
   latency = pattern.findall(str1)[0]

   if (str(unit) == "nsec"):
      latency = round(float(latency)/1000,2)
   else:
      latency = round(float(latency),2)

   print("unit",unit)
   print("here",latency)
