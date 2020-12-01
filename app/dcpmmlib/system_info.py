import os

def Numa_Node_Number():
    node_number=os.popen("lscpu|grep 'NUMA node(s):'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read();
   # print(node_number);
    return node_number;


def Socket_Number():
    socket_number=os.popen("lscpu|grep 'Socket(s):'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read();
   # print(socket_number);
    return socket_number;

if __name__=="__main__":
    Numa_Node_Number();
    Socket_Number();
   # print(os.popen("lscpu|grep 'NUMA node(s):'|awk -F ':' '{print $2'}|tr -d '[:space:]'").read());
