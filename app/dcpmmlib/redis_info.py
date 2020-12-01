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


def get_data(click):
   values = [];

   a = [1,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40]
   print(len(a))
   if (click > 20 ):
      click = 20
   name = "result_"+str(a[click])+".log"
   print(name)
   condition = True
   value_one = {}
   path="/home/xiaoran/ui_pmem/pmem_demo/app/shell/"
   path_2="/home/xiaoran/fio/rdma_test_results/"


   if (os.path.exists(path+name) and os.path.exists(path_2+name)):

      # line 1
      f = open(path+name,'r')
      lines = f.readlines()
      if (len(lines) < 2):
         return values
      str1 = lines[2]
      print(str1)
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
      print(width)
      value_one["bw"] = [a[click],width]

      # line 2 
      f = open(path_2+name,'r')
      lines = f.readlines()

      bw = lines[2].split()[3]
      print("this is ", bw)
   
      if (float(bw) > 100.0):
         width_2 = round(float(bw) / 1074 ,2 )
      else:
         width_2 = round(float(bw),2)
      print(width_2)

      value_one["rdma"] = [a[click],width_2]

      
      values.append(value_one)
      condition = False
   else:
      print("shuile")
      return values
   
   #不知valueone重复加入会如何，还是应该有value two来读第二条线
   #还有就是两个while的顺序问题


      # path="/home/xiaoran/fio/rdma_test_results/"
      # if (os.path.exists(path+name)):
      #    f = open(path+name,'r')
      #    lines = f.readlines()
      #    bw = lines[2].split()
      #    if (float(bw) > 100.0):
      #       width = round(float(bw) / 1074 ,2 )
      #    else:
      #       width = round(float(bw),2)
      #    print(width)
      #    value["rdma"] = [a[click],width]
      #    values.update(value_one)
      # else:
      #    print("kunle")
      #    return values
   return values;




# if __name__=="__main__":
#     # r = redis.Redis(host='localhost', port=6379, decode_responses=True)
#     # get_current_commands(r);
#      get_current_info();
#     # timer = threading.Timer(1.0 , get_current_info)
#     # timer.start()
