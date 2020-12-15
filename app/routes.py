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



@app.before_first_request
def before_first_request():

    # session['click_read'] = 0
    # session['click_write'] = 0
    session['time'] = 0
    session['mode'] = "default"


    session['click_rdma'] = 7
    session['mode_rdma'] = "default"



@app.route('/moding')
def show():
    mode = session['mode']
    print(mode)
    return mode

@app.route('/moding_rdma')
def shower():
    mode = session['mode_rdma']
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


#@app.route('/test_post/', methods=['POST'], strict_slashes=False)
#def test_post():
#    a = request.args.get('a', 0, type=int)
#    b = request.args.get('b', 0, type=int)
#    return jsonify(result=a + b)
#'''

@app.route('/mode_info')
def load_mode():
    mode =jsonify(DCPMM_Mode1());
    return mode;

@app.route('/flush')
def clear():

    # session['click_rdma'] = 0
    # session['click_read'] = 0
    session['click_write'] = 0
    print("mode", session['mode'])
    return session['mode']


@app.route('/test_post', methods=['POST'], strict_slashes=False)
def test_post():

    a = request.form.get("mode")
    print("a",a)
    b = request.args.get('value', 0, type=str)
    print("this",a,":",b)
    return jsonify(result=[a,b])


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

    # clicks = {
    #     "read_rpma":'click_read',
    # "write_rpma":'click_write'}

    # rdma
    # session[clicks[mode_name]] = 0


    os.popen("top -n 1 | grep -e 'rpma_fio_sh' -e 'fio'")

    os.system("killall -9 fio")
    os.system("killall -9 run.sh")

    # if (mode_name == "")

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


    # session['click_rdma'] = 0

    # rdma
    # session[clicks[mode_name]] = 0


    os.popen("top -n 1 | grep -e 'rpma_fio_sh' -e 'fio'")

    os.system("killall -9 fio")
    os.system("killall -9 run.sh")

    # if (mode_name == "")

    thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/examples/'+file_names[mode_name]+'/./run.sh',))
    thread.start()
    session['time']=time.time()


    return "nop"


@app.route('/refresh_write',methods=['POST'])
def clear_write():

    data = request.json
    print("origin",data)
    data = data.get('mode')
    print(data)

    print("whatsssssss")
    session['mode'] = "read_rpma"
    mode_name = session['mode']
    file_names={"read_rpma":"read_results",
    "write_rpma":"write_results"}

    # clicks = {
    #     "read_rpma":'click_read',
    # "write_rpma":'click_write'}

    # rdma
    # session[clicks[mode_name]] = 0


    os.popen("top -n 1 | grep -e 'rpma_fio_sh' -e 'fio'")

    os.system("killall -9 fio")
    os.system("killall -9 run.sh")

    # if (mode_name == "")

    thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/examples/'+file_names[mode_name]+'/./run.sh',))
    thread.start()
    session['time']=time.time()


    return "nop"


# @app.route('/selection', methods=['GET','POST'])
# def one():
#     mode_name= request.form.get("mode")
#     session['mode'] = mode_name
#     print("go_to",session['mode'])

#     if (mode_name == "read_rpma"):
#         session['mode_rdma'] = "read_rdma"
#     if (mode_name == "write_rpma"):
#         session['mode_rdma'] = "write_rdma"

#     file_names={"read_rpma":"read_results",
#     "write_rpma":"write_results"}

#     clicks = {
#         "read_rpma":'click_read',
#     "write_rpma":'click_write'}

#     session[clicks[mode_name]] = 0


#     os.popen("top -n 1 | grep -e 'rpma_fio_sh' -e 'fio'")

#     os.system("killall -9 fio")
#     os.system("killall -9 run.sh")
#     # if (mode_name == "")
#     #??
#     thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/examples/'+file_names[mode_name]+'/./run.sh',))
#     thread.start()
#     session['time']=time.time()


#     print("go_to",session['mode_rdma'])

    # return redirect('/')


# @app.route('/selection_rdma', methods=['GET','POST'])
# def two():
#     session['mode_rdma'] = request.form.get("mode_rdma")
#     print("go_to",session['mode_rdma'])
#     return redirect('/')


@app.route('/memory_info')
def load_memory():

    mode = session['mode']

    #compare 直接返回系统使用率/0


    result = DCPMM_Capacity(mode)
    memory = jsonify(result)
    return memory

@app.route('/redis_info')
def load_redis():
    click_rdma = session['click_rdma']

    mode = session['mode']
    mode_rdma = session['mode_rdma']
    print("show mode: ",mode)

    #加上rdma第二条线
    # clicks = {
    #     "read_rpma":'click_read',
    # "write_rpma":'click_write',}


    result = get_data_new(mode,click_rdma,mode_rdma)
    # time_2 = time.time()
    # print("pass time:", time_2-session['time'])
    # session['time'] = time_2



    # 有变化的rdma线
    # if (mode != "default"):
    #     if (result[mode_rdma] == [0,0]):
    #         pass
    #     else:
    #         session['click_rdma']+=1

    # print("my click",session['click_rdma'])
    # if (session['click_rdma'] == 8):
    #     session['click_rdma'] = 7

    # get_test_info
    
    if (result == False):
        return None
    redis = jsonify(result)
    print(redis)
    return redis;
    

# 先不用
@app.route('/redis_info_rdma')
def load_redis_rdma():
    click = session['click_rdma']
    mode = session['mode_rdma']
    print("click_rdma: ",click)
    print("show mode rdma: ",mode)
    if (click > 20 ):
        session['click_rdma'] = 20
    if click == 0:
        time.sleep(3)
    result = get_data_rdma(click,mode)
    redis = jsonify(result)
    if (len(result) != 0):
        print(len(result))
        session['click_rdma'] +=1
    else:
        pass
    return redis;



@app.route('/stop_server')
def stop_server():
    servers =jsonify(stop_servers());
    return servers;

@app.route('/run_test')
def run_test(): 
    test =jsonify(run_tests());
    return test;

# @app.route('/ajax')
# def ajax():
#     #a = 'get获取到'+request.args['name']
#     print 123
#     #a = 20
#     return jasonify(result=a)

if __name__ == '__main__':

    app.run(host='0.0.0.0', port=3000)
    before_first_request()
