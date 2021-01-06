import redis
import threading
import time
import os
import re
import math

# not used, possible to read 4 lines in one chart and read from different files
def get_data(click_sync_read,click_sync_write,click_async_read
    ,click_async_write,mode):
   values = [];
   value = []  

   a = [1,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40]
   # if (click > 20 ):
   #    click = 20
   
   print("here",click_sync_read)


   number_1 = a[click_sync_read]
   number_2 = a[click_sync_write]
   number_3 = a[click_async_read]
   number_4 = a[click_async_write]

   name_1 = "result_"+str(number_1)+".log"
   name_2 = "result_"+str(number_2)+".log"
   name_3 = "result_"+str(number_3)+".log"
   name_4 = "result_"+str(number_4)+".log"

   path_1="/home/xiaoran/fio/examples/sync_read_results/"
   path_2="/home/xiaoran/fio/examples/sync_write_results/"
   path_3="/home/xiaoran/fio/examples/async_read_results/"
   path_4="/home/xiaoran/fio/examples/async_write_results/"

   if (mode == "sync_read_rpma"):
      value = get_data_sync_read_rpma(number_1)
   elif (mode == "sync_write_rpma"):
      value = get_data_sync_write_rpma(number_2)
   elif (mode == "async_read_rpma"):
      value = get_data_async_read_rpma(number_3)
   elif (mode == "async_write_rpma"):
      value = get_data_async_write_rpma(number_4)
   elif (mode == "compare"):
      value_1 = get_data_sync_read_rpma(number_1)
      value_2 = get_data_sync_write_rpma(number_2)
      value_3 = get_data_async_read_rpma(number_3)
      value_4 = get_data_async_write_rpma(number_4)
      if (not value_1):
         value_1 = {"sync_read_rpma": []}
      if (not value_2):
         value_2 = {"sync_write_rpma": []}
      if (not value_3):
         value_3 = {"async_read_rpma": []}
      if (not value_4):
         value_4 = {"async_write_rpma": []}

      values.append(value_1)
      values.append(value_2)
      values.append(value_3)
      values.append(value_4)
      return values
   else:
      return values

   
   #不是空值才加入values，空值values不会加点, 单体
   if (not value):
      print("ma le")
      return(values)
   else:
      values.append(value)
      return values



def get_data_new(mode,click_rdma,mode_rdma):
   

   if (mode == "read_rpma"):
      value = get_data_read_rpma()
      value[mode_rdma]=get_data_read_rdma(click_rdma)
   elif(mode == "write_rpma"):
      print("got in")
      value = get_data_write_rpma()
      value[mode_rdma]=get_data_write_rdma(click_rdma)
   else:
      #因为图表类型为log图表，没有0值所以传这个
      value = {"default":[0.01,0]}


   return value


#返回的是value_one,单个字典值。读取的是特殊处理过的fio结果文件，处理方法在run.sh里
def get_data_read_rpma():
   number=0
   name = "result.log"
   # print(name)
   path="/home/xiaoran/fio/examples/read_results/"
   value_one = {"read_rpma":[1,0,0]}

   if (os.path.exists(path+name)):

      # bw
      f = open(path+name,'r')
      lines = f.readlines()
      if (len(lines) < 2):
         return values
      str1 = lines[2]
      str2 = lines[1]
      print(str2)

      pattern = re.compile(r'(?<=BW=)\d+\.?\d+')
      pattern2 = re.compile('MiB/s|GiB/s')
      pattern3 = re.compile(r'(?<=jobs=)\d+')

      width = pattern.findall(str1)
      unit = pattern2.findall(str1)
      jobs = pattern3.findall(str2)[0]

      if (unit[0] == "MiB/s"):
         width = round(float(width[0]) / 1074 ,2 )
      else:
         width = round(float(width[0]),2)
      # print("BW is :",width)

      # latency
      str_lat = lines[3]
      pattern_lat = re.compile(r'(?<=avg=)\d+\.?\d+')
      pattern_sec = re.compile('nsec|usec')

      unit = pattern_sec.findall(str_lat)[0]
      latency = pattern_lat.findall(str_lat)[0]

      if (str(unit) == "nsec"):
         latency = round(float(latency)/1000,2)
      else:
         latency = round(float(latency),2)

      # print("latency is: ",latency)

      value_one["read_rpma"] = [latency,width,jobs]

      print("value_one latency is:",latency )
      print("and bw is:", width)
      
      
   else:
      print("shuile")
      return value_one
   
   return value_one

def get_data_write_rpma():

   name = "result.log"

   value_one = {"write_rpma":[1,0,0]}
   path="/home/xiaoran/fio/examples/write_results/"


   if (os.path.exists(path+name)):

      # line 1
      f = open(path+name,'r')
      lines = f.readlines()
      if (len(lines) < 2):
         return values
      str1 = lines[2]
      str2 = lines[1]

      pattern = re.compile(r'(?<=BW=)\d+\.?\d+')
      pattern2 = re.compile('MiB/s|GiB/s')
      # print(pattern.findall(str1))
      # print(pattern2.findall(str1))
      width = pattern.findall(str1)
      unit = pattern2.findall(str1)
      if (unit[0] == "MiB/s"):
         width = round(float(width[0]) / 1074 ,2 )
      else:
         width = round(float(width[0]),2)
      # print("BW is :",width)

      #line 1 latency
      str_lat = lines[3]
      # print(str_lat)
      pattern_lat = re.compile(r'(?<=avg=)\d+\.?\d+')
      pattern_sec = re.compile('nsec|usec')
      # print(pattern.findall(str1))
      # print(pattern2.findall(str1))
      unit = pattern_sec.findall(str_lat)[0]
      latency = pattern_lat.findall(str_lat)[0]

      pattern3 = re.compile(r'(?<=jobs=)\d+')
      jobs = pattern3.findall(str2)[0]
      print("jobs here",jobs)

      if (str(unit) == "nsec"):
         latency = round(float(latency)/1000,2)
      else:
         latency = round(float(latency),2)

      # print("latency is: ",latency)

      value_one["write_rpma"] = [latency,width,jobs]

      
      print("value_one latency is:",latency )
      print("and bw is:", width)
      
   else:
      print("maa le")
      return value_one
   
   return value_one


def get_data_read_rdma(click_rdma):
   a = [1,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40]
   number = a[click_rdma]
   name = "result_"+str(number)+".log"
   print(name)
   value_one = [0,0]
   path="/home/xiaoran/fio/examples/read_rdma_bw/"
   path_lat="/home/xiaoran/fio/examples/read_rdma_lat/"

   width = 0
   latency = 0


   if (os.path.exists(path+name) and os.path.exists(path_lat+name)):

      #bw
      f = open(path+name,'r')
      lines = f.readlines()

      bw = lines[2].split()[3]
      

      print("this is ", bw)
   
      if (float(bw) > 20.0):
         width_2 = round(float(bw) / 1074 ,2 )
      else:
         width_2 = round(float(bw),2)
      print(width_2)
      width = width_2

   
      #bw
      f = open(path_lat+name,'r')
      lines = f.readlines()

      lat = lines[2].split()[5]
      print("this is lat", lat)
   
      latency = round(float(lat),2)

      value_one = [latency,width,]
      
   else:
      print("shuile")
      return value_one
   
   return value_one


def get_data_write_rdma(click_rdma):
   a = [1,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40]
   number = a[click_rdma]
   name = "result_"+str(number)+".log"
   print(name)
   value_one = [0,0]
   path="/home/xiaoran/fio/examples/write_rdma_bw/"
   path_lat="/home/xiaoran/fio/examples/read_rdma_lat/"

   width = 0
   latency = 0


   if (os.path.exists(path+name) and os.path.exists(path_lat+name)):

      #line2
      f = open(path+name,'r')
      lines = f.readlines()

      bw = lines[2].split()[3]
      print("this is ", bw)
   
      if (float(bw) > 20.0):
         width_2 = round(float(bw) / 1074 ,2 )
      else:
         width_2 = round(float(bw),2)
      print(width_2)
      width = width_2
         
      #bw
      f = open(path_lat+name,'r')
      lines = f.readlines()

      lat = lines[2].split()[5]
      print("this is lat", lat)
   
      latency = round(float(lat),2)

      value_one = [latency,width]
      
   else:
      print("shuile")
      return value_one
   
   return value_one


