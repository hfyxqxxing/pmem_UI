import redis
import threading
import time
import os
import re
import math

last_commands={};
def get_current_info():
    global last_commands;
    ports=[];
    redis_infos=[];
    instance=os.popen("ps -ef|grep redis").readlines();
    for line in instance:
       x=line.split("redis-server *:");
       if(len(x)>1):
         ports.append((x[1].split("\n"))[0]);
    for port_num in ports:
        port_info=[];
        r = redis.Redis(host='localhost', port=port_num, decode_responses=True);
        redis_info = r.info();
        for key in redis_info:
            if key=='instantaneous_ops_per_sec':
              #  print(key, redis_info['instantaneous_ops_per_sec']);
               ops_sec=redis_info['instantaneous_ops_per_sec'];
             #  print(ops_sec);
               port_info.append(ops_sec);
            if key == 'total_commands_processed':
               tcommands=redis_info['total_commands_processed'];
               if last_commands.has_key(str(port_num))==False:
                  last_commands[str(port_num)]=0;
               qps=(tcommands-last_commands[str(port_num)])/10.0
               last_commands[str(port_num)]=tcommands;
             #  port_info.append(tcommands);
             #  port_info.append(last_commands);
               port_info.append(qps);
            if key == 'used_memory':
               used_memory=redis_info['used_memory'];
               port_info.append(used_memory);
        redis_infos.append(port_info);
    return redis_infos;
  
  #  global timer
   # timer = threading.Timer(1.0,get_current_info)
   # timer.start()


def get_current_info1():
    r = redis.Redis(host='localhost', port=9001, decode_responses=True);
    global last_commands;
    redis_info = r.info();
    info=[];
    for key in redis_info:
        if key=='instantaneous_ops_per_sec':
           # print(key, redis_info['instantaneous_ops_per_sec']);
           ops_sec=redis_info['instantaneous_ops_per_sec'];
           info.append(ops_sec);
        if key == 'total_commands_processed':
           tcommands=redis_info['total_commands_processed'];
           qps=(tcommands-last_commands)/2.0
           last_commands=redis_info['total_commands_processed'];
           info.append(tcommands);
           info.append(last_commands);
           info.append(qps);
        if key == 'used_memory':
           used_memory=redis_info['used_memory'];
           info.append(used_memory);
    print(info);
    return info;

   # global timer
   # timer = threading.Timer(1.0,get_current_info , [r])
   # timer.start()

def get_current_commands(r):
    global last_commands;
    redis_info=r.info()
    for key in redis_info:
        if key == 'total_commands_processed':
            last_commands=redis_info['total_commands_processed'];
          # print('start_commands', last_commands);


def get_data(click,mode):
   values = [];

   a = [1,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40]
   if (click > 20 ):
      click = 20
   
   number = a[click]

   name = "result_"+str(number)+".log"

   path_1="/home/xiaoran/fio/examples/sync_read_results/"
   path_2="/home/xiaoran/fio/examples/sync_write_results/"
   path_3="/home/xiaoran/fio/examples/async_read_results/"
   path_4="/home/xiaoran/fio/examples/async_write_results/"

   if (mode == "sync_read_rpma"):
      value = get_data_sync_read_rpma(number)
   elif (mode == "sync_write_rpma"):
      value = get_data_sync_write_rpma(number)
   elif (mode == "async_read_rpma"):
      value = get_data_async_read_rpma(number)
   elif (mode == "async_write_rpma"):
      value = get_data_async_write_rpma(number)
   elif (mode == "default"):
      if (os.path.exists(path_1+name) and os.path.exists(path_2+name) 
      and os.path.exists(path_3+name) and os.path.exists(path_4+name)):
         value_1 = get_data_sync_read_rpma(number)
         value_2 = get_data_sync_write_rpma(number)
         value_3 = get_data_async_read_rpma(number)
         value_4 = get_data_async_write_rpma(number)
         values.append(value_1)
         values.append(value_2)
         values.append(value_3)
         values.append(value_4)
         return values
      else:
         return values
   else:
      return values
   
   #不是空值才加入values，空值values不会加点
   if (not value):
      print("ma le")
      return(values)
   else:
      values.append(value)
      return values




#应该写成均返回得是value_one,单个字典值。
def get_data_sync_read_rpma(number):

   name = "result_"+str(number)+".log"
   print(name)
   value_one = {}
   path="/home/xiaoran/fio/examples/sync_read_results/"


   if (os.path.exists(path+name)):

      # line 1
      f = open(path+name,'r')
      lines = f.readlines()
      if (len(lines) < 2):
         return values
      str1 = lines[2]

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
      print("BW is :",width)
      value_one["sync_read_rpma"] = [number,width]
      
   else:
      print("shuile")
      return value_one
   
   return value_one

def get_data_sync_write_rpma(number):

   name = "result_"+str(number)+".log"
   print(name)
   value_one = {}
   path="/home/xiaoran/fio/examples/sync_write_results/"


   if (os.path.exists(path+name)):

      # line 1
      f = open(path+name,'r')
      lines = f.readlines()
      if (len(lines) < 2):
         return values
      str1 = lines[2]

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
      print("BW is :",width)
      value_one["sync_write_rpma"] = [number,width]
      
   else:
      print("maa le")
      return value_one
   
   return value_one

def get_data_async_read_rpma(number):

   name = "result_"+str(number)+".log"
   print(name)
   value_one = {}
   path="/home/xiaoran/fio/examples/async_read_results/"


   if (os.path.exists(path+name)):

      # line 1
      f = open(path+name,'r')
      lines = f.readlines()
      if (len(lines) < 2):
         return values
      str1 = lines[2]

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
      print("BW is :",width)
      value_one["async_read_rpma"] = [number,width]
      
   else:
      print("maaa le")
      return value_one
   
   return value_one


def get_data_async_write_rpma(number):

   name = "result_"+str(number)+".log"
   print(name)
   value_one = {}
   path="/home/xiaoran/fio/examples/async_write_results/"


   if (os.path.exists(path+name)):

      # line 1
      f = open(path+name,'r')
      lines = f.readlines()
      if (len(lines) < 2):
         return values
      str1 = lines[2]

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
      print("BW is :",width)
      value_one["async_write_rpma"] = [number,width]
      
   else:
      print("maaaa le")
      return value_one
   
   return value_one


