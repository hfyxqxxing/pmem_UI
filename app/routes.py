# -*- coding: utf-8 -*-
from flask import Flask, render_template, request,session,current_app, redirect, url_for
from flask import jsonify

from dcpmmlib.memory_info import DCPMM_Mode1;
from dcpmmlib.memory_info import get_sys_info;
from dcpmmlib.memory_info import DCPMM_Capacity;
from dcpmmlib.redis_info import *;
from dcpmmlib.arg_info import stop_servers
from dcpmmlib.arg_info import run_tests

import os
import threading
import time

app = Flask(__name__)


app.secret_key = 'xxxxx'

global_mode_name = None
global_path = ""
global_shell_name= ""


@app.before_first_request
def before_first_request():

    session['time'] = 0
    session['mode'] = "default"


    session['click_rdma'] = 7
    session['mode_rdma'] = "default"



@app.route('/moding')
def show():
    mode = session['mode']
    print(mode)
    return mode



@app.route('/')
def index():
    modes= DCPMM_Mode1();
    if modes=="AD_Mode" or modes=="Numa_Node":
        sys_info = {}
        sys_info = get_sys_info()
        # return 时命名该字典以被调用
        return render_template('index_demo.html',sys_info=sys_info);
    elif modes=="2LM":
        return render_template('index_memory.html');
    elif modes=="1LM":
        return render_template('index_1lm.html');
    return render_template('index_ad.html')



@app.route('/mode_info')
def load_mode():
    mode =jsonify(DCPMM_Mode1());
    return mode;



@app.route('/choose',methods=['GET'])
def cleares():
    print("whoooo")
    data = request.args.get('mode','')
    print("origin_read",data)

    print("whatsssssss")
    session['mode'] = data
    mode_name = session['mode']

    if (mode_name == "read_rpma"):
        session['mode_rdma']="read_rdma"
    elif (mode_name == "write_rpma"):
        session['mode_rdma']="write_rdma"
    

    file_names={"read_rpma":"read_results",
    "write_rpma":"write_results",}


    os.system("killall -9 run.sh")


    thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/examples/'+file_names[mode_name]+'/./run.sh',))
    thread.start()
    session['time']=time.time()


    return "nop"


@app.route('/refresh')
def clear_again():
    print("whoooo")

    mode_name = session['mode']
    file_names={"read_rpma":"read_results",
    "write_rpma":"write_results"}


    session['click_rdma'] = 0

    os.system("killall -9 run.sh")

    # if (mode_name == "")
    if (mode_name != "default"):
        thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/examples/'+file_names[mode_name]+'/./run.sh',))
        thread.start()  

    session['time']=time.time()


    return "nop"




@app.route('/memory_info')
def load_memory():

    mode = session['mode']
    result = DCPMM_Capacity(mode)
    memory = jsonify(result)
    return memory

@app.route('/redis_info')
def load_redis():
    click_rdma = session['click_rdma']

    mode = session['mode']
    mode_rdma = session['mode_rdma']
    print("show mode: ",mode)


    result = get_data_new(mode,click_rdma,mode_rdma)



    if (mode != "default"):
        if (result[mode_rdma] == [0,0]):
            pass
        else:
            session['click_rdma']+=1

    print("my click",session['click_rdma'])
    if (session['click_rdma'] == 8):
        session['click_rdma'] = 7

    
    if (result == False):
        return None
    redis = jsonify(result)
    print(redis)
    return redis;
    

if __name__ == '__main__':

    app.run(host='0.0.0.0', port=3000)