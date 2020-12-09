import os, time , re
#from system_info import Numa_Node_Number



def get_sys_info():
   cpu_numbers = os.popen("lscpu | grep 'CPU(s):' | awk '{print $2} '").readlines()[0].split('\n')[0];
   sockets = os.popen("lscpu | grep 'Socket(s):' | awk '{print $2} '").readlines()[0].split('\n')[0];
   Threads = os.popen("lscpu | grep 'Thread(s) per core:' | awk '{print $4}'").readlines()[0].split('\n')[0];
   cores = os.popen("lscpu | grep 'Core(s) per socket:' | awk '{print $4}'").readlines()[0].split('\n')[0];
   node0 = os.popen("lscpu | grep 'NUMA node0 CPU(s):' | awk '{print $4}'").readlines()[0].split('\n')[0];
   node1 = os.popen("lscpu | grep 'NUMA node1 CPU(s):' | awk '{print $4}'").readlines()[0].split('\n')[0];

   sys_info = {}
   sys_info["cpu"]=cpu_numbers
   sys_info["sockets"]=sockets
   sys_info["threads"]=Threads
   sys_info["cores"]=cores
   sys_info["node0"]=node0
   sys_info["node1"]=node1

   print(sys_info)
   
   return sys_info



def Numa_Node_Number():
    node_number=os.popen("lscpu|grep 'NUMA node(s):'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read();
   # print(node_number);
    return node_number;

#names = locals();
def DCPMM_Mode1():
    mode=os.popen("ipmctl show -region|tr -d '\n'").read();
    time.sleep(0.5)
    if mode=="There are no Regions defined in the system.":
       return "2LM";
    else:
       x=mode.split("|");
       ad_mode=x[7].replace(' ', '');
       node_number=Numa_Node_Number();
       pmem=os.popen("df -hl | grep pmem1").read();
       if ad_mode=="AppDirect" and pmem != "":
          if node_number=="2":
             return "AD_Mode";
          elif node_number=='4':
             return "Numa_Node";
       else:
          return "1LM";

def DCPMM_Mode():
    return "1LM"


def DCPMM_Capacity(click,mode_mine):
   #mode = DCPMM_Mode1()
    mode=DCPMM_Mode1();
    print(mode)
    if mode=="2LM" or mode=="1LM":
       memory= Memory_Mode_Capacity();
       return memory;
    else:
       if mode=="AD_Mode":
          ad= AD_Mode_Capacity(click,mode_mine);
          return ad;
       elif mode=="Numa_Node":
          numa= Numa_Node_Capacity();
          return numa;
       else:
          return "1LM";    


def Memory_Mode_Capacity():
    node_number=Numa_Node_Number();
    node_size=[];
    node_free=[];
    node_used=[];
    for index in range(0,int(node_number)):
        node_size.append(float(os.popen("numactl -H|grep 'node " + str(index) + " size'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
        node_free.append(float(os.popen("numactl -H|grep 'node " + str(index) + " free'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
        node_used.append(((node_size[index]-node_free[index])/node_size[index])*100.0);
    return node_size,node_free,node_used


def get_cpu(path,prev):
   if (os.path.exists(path)):
      f = open(path,'r')
      lines = f.readlines()
      print(lines)
      str1 = lines[4]
      pattern = re.compile(r'(?<=usr=)\d+\.?\d+')
      cpu_usage = pattern.findall(str1)[0]
   else:
      if (os.path.exists(prev)):
         f = open(prev,'r')
         lines = f.readlines()
         print(lines)
         str1 = lines[4]
         pattern = re.compile(r'(?<=usr=)\d+\.?\d+')
         cpu_usage = pattern.findall(str1)[0]
      else:
         cpu_usage = os.popen("top -n 1 | grep Cpu | awk '{print $2}'").read()
         print("wrong reached:",cpu_usage)
   print("reached",cpu_usage)
   return cpu_usage


def AD_Mode_Capacity(click,mode):
   # 要传click参数打开文件那一套

    a = [1,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40]
    
    name = "yes"
    number = a[click] 
    node_number=Numa_Node_Number();
    node_size=[];
    node_free=[];
    node_used=[];
    print("heressssss",mode,"numberrrr",number)

    if (mode == "sync_read_rpma"):
       name = "sync_read_results"
       path = "/home/xiaoran/fio/examples/"+name+"/result_"+str(number)+".log"
       path_prev = "/home/xiaoran/fio/examples/"+name+"/result_"+str(number-2)+".log"
       cpu_usage = get_cpu(path,path_prev)
    elif (mode == "sync_write_rpma"):
       name = "sync_write_results"
       path = "/home/xiaoran/fio/examples/"+name+"/result_"+str(number)+".log"
       path_prev = "/home/xiaoran/fio/examples/"+name+"/result_"+str(number-2)+".log"
       cpu_usage = get_cpu(path,path_prev)
    elif (mode == "async_read_rpma"):
       name = "async_read_results"
       path = "/home/xiaoran/fio/examples/"+name+"/result_"+str(number)+".log"
       path_prev = "/home/xiaoran/fio/examples/"+name+"/result_"+str(number-2)+".log"
       cpu_usage = get_cpu(path,path_prev)
    elif (mode == "async_write_rpma"):
       name = "async_write_results"
       path = "/home/xiaoran/fio/examples/"+name+"/result_"+str(number)+".log"
       path_prev = "/home/xiaoran/fio/examples/"+name+"/result_"+str(number-2)+".log"
       cpu_usage = get_cpu(path,path_prev)
    elif (mode == "compare"):
       cpu_usage = os.popen("top -n 1 | grep Cpu | awk '{print $2}'").readline()
    else:
       print("why")
       cpu_usage = "0"

    node_size.append(" ")
    node_free.append(" ")

    # 从每次的fio获取？？？
    node_used.append(float(cpu_usage))


    
    print(os.popen("numactl -H|grep 'node size'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read())
    node_size.append(float(os.popen("numactl -H|grep 'node 0 size'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
    node_free.append(float(os.popen("numactl -H|grep 'node 0 free'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
    print(((node_size[1]-node_free[1])/node_size[1])*100.0)
    node_used.append(((node_size[1]-node_free[1])/node_size[1])*100.0);
    # 这里要改 
    node_size.append(float(os.popen("df -hl|grep '/dev/pmem1'|awk -F ' ' '{print $2'}|tr -d '\n'").read().split("G")[0])*1024);
    node_free.append(float(os.popen("df -hl|grep '/dev/pmem1'|awk -F ' ' '{print $4'}|tr -d '\n'").read().split("G")[0])*1024);
    node_used.append(((node_size[2]-node_free[2])/node_size[2])*100.0);


   # 等待完整性能检测
   #  for index in range(0,int(node_number)):
   #      node_size.append(float(os.popen("numactl -H|grep 'node " + str(index) + " size'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
   #      node_size.append(float(os.popen("df -hl|grep '/dev/pmem" + str(index) +"'|awk -F ' ' '{print $2'}|tr -d '\n'").read().split("G")[0])*1024);
   #      node_free.append(float(os.popen("numactl -H|grep 'node " + str(index) + " free'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
   #      node_free.append(float(os.popen("df -hl|grep '/dev/pmem" + str(index) +"'|awk -F ' ' '{print $4'}|tr -d '\n'").read().split("G")[0])*1024);
   #     # node_used.append((node_size[index]-node_free[index])/node_size[index]);
   #     # node_used.append((node_size[index+1]-node_free[index+1])/node_size[index+1]);
   #     # node_used.append(float(os.popen("df -hl|grep '/dev/pmem" + str(index) +"'|awk -F ' ' '{print $3'}|tr -d '\n'").read().split("M")[0]));
   #  for index in range(0,4):
   #      node_used.append(((node_size[index]-node_free[index])/node_size[index])*100.0);
   # print(node_size,node_free,node_used);
    return node_size, node_free, node_used

def Numa_Node_Capacity():
    node_number=Numa_Node_Number();
    node_size=[];
    node_free=[];
    node_used=[];
    print(node_number);
    for index in range(0,int(node_number)):
       # names['node'+ str(index)]=index;
        node_size.append(float(os.popen("numactl -H|grep 'node " + str(index) + " size'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
        node_free.append(float(os.popen("numactl -H|grep 'node " + str(index) + " free'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
        node_used.append(((node_size[index]-node_free[index])/node_size[index])*100.0);
       # print(node_size)
       # names['node'+str(index)+'_size']=os.popen("numactl -H|grep 'node " + str(index) + " size'").read();
       # names['node'+str(index)+'_free']=os.popen("numactl -H|grep 'node " + str(index) + " free'").read();
       # print(names['node'+ str(index)+'_size']);
       # print(names['node'+ str(index)+'_free']);
    print(node_size,node_free);
    return node_size,node_free,node_used;

if __name__=="__main__":
   # Numa_Node_Capacity();
   # Memory_Mode_Capacity();
   #  AD_Mode_Capacity();
     DCPMM_Mode1();
     DCPMM_Capacity();
 
