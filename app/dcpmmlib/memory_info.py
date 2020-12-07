import os, time
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
      # if ad_mode=="AppDirect" and node_number=='2':
       #   return "AD_Mode";
      # elif  ad_mode=="AppDirect" and node_number=='4':
       #   return "Numa_Mode";
      # else:
       #   return "1lm";

def DCPMM_Mode():
    return "1LM"


def DCPMM_Capacity():
    mode=DCPMM_Mode1();
    print(mode)
    if mode=="2LM" or mode=="1LM":
       memory= Memory_Mode_Capacity();
       return memory;
    else:
       if mode=="AD_Mode":
          ad= AD_Mode_Capacity();
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
    return node_size,node_free,node_used;

def AD_Mode_Capacity():
    node_number=Numa_Node_Number();
    node_size=[];
    node_free=[];
    node_used=[];
    print(os.popen("numactl -H|grep 'node size'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read())
    node_size.append(float(os.popen("numactl -H|grep 'node 1 size'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
    node_size.append(float(os.popen("df -hl|grep '/dev/pmem1'|awk -F ' ' '{print $2'}|tr -d '\n'").read().split("G")[0])*1024);
    node_free.append(float(os.popen("numactl -H|grep 'node 1 free'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read().split("MB")[0]));
    node_free.append(float(os.popen("df -hl|grep '/dev/pmem1'|awk -F ' ' '{print $4'}|tr -d '\n'").read().split("G")[0])*1024);
    for index in range(0,2):
        node_used.append(((node_size[index]-node_free[index])/node_size[index])*100.0);


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
    return node_size, node_free, node_used;

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
 
