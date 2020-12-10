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

    session['click_read'] = 0
    session['click_write'] = 0
    session['time'] = 0
    session['mode'] = "default"
    # 这个脚本应该处理循环的问题
    # thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/examples/sync_read_results/./ui_rpma.sh',))
    # thread.start()

    session['click_rdma'] = 0
    session['mode_rdma'] = "read_rdma"
    # g.username = 0


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
   # memory =jsonify([10,20,30,40]);
    return mode;

# @app.route('/moding',methods=['GET','POST'])
# def the_mode():
#     print("man",session['mode'])

#     return session['mode']


@app.route('/flush')
def clear():

    session['click_rdma'] = 0
    session['click_read'] = 0
    session['click_write'] = 0
    print("mode", session['mode'])
    return session['mode']

@app.route('/selection', methods=['GET','POST'])
def one():
    mode_name= request.form.get("mode")
    session['mode'] = mode_name
    print("go_to",session['mode'])
    if (mode_name == "read_rpma"):
        session['mode_rdma'] = "read_rdma"
    if (mode_name == "write_rpma"):
        session['mode_rdma'] = "write_rdma"

    file_names={"read_rpma":"read_results",
    "write_rpma":"write_results"}

    clicks = {
        "read_rpma":'click_read',
    "write_rpma":'click_write'}

    session[clicks[mode_name]] = 0


    os.popen("top -n 1 | grep -e 'rpma_fio_sh' -e 'fio'")

    os.system("killall -9 fio")
    os.system("killall -9 run.sh")
    # if (mode_name == "")
    #??
    thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/examples/'+file_names[mode_name]+'/./run.sh',))
    thread.start()

    # 可去除    
    # if (mode_name == "compare"):
    #     os.system("killall -9 ui_rpma.sh")
    
    # os.system("/home/xiaoran/fio/examples/"+file_names[mode_name]+"/./ui_rpma.sh")


    print("go_to",session['mode_rdma'])

    return redirect('/')


# @app.route('/selection_rdma', methods=['GET','POST'])
# def two():
#     session['mode_rdma'] = request.form.get("mode_rdma")
#     print("go_to",session['mode_rdma'])
#     return redirect('/')


@app.route('/memory_info')
def load_memory():
    click_read = session['click_read']
    click_write = session['click_write']
    mode = session['mode']

    #compare 直接返回系统使用率/0


    result = DCPMM_Capacity(mode)
    memory = jsonify(result)
   # memory =jsonify([10,20,30,40]);
    return memory

@app.route('/redis_info')
def load_redis():
    click_read = session['click_read']
    click_write = session['click_write']

    mode = session['mode']
    print("show mode: ",mode)

    clicks = {
        "read_rpma":'click_read',
    "write_rpma":'click_write',}

    # ??
    if (mode == "default"):
        result = get_data_new(mode)
    else:
        if clicks[mode] == 0:
            # time.sleep(5)
            result = get_data_new(mode)
            session[clicks[mode]]+=1
        else:
            result = get_data_new(mode)

    

    #判断每个是否有返回值，有则加一
    # if (mode == "compare"):
    #     for elem in result:
    #         name, = elem
    #         if (len(elem[name])!=0):
    #             print("namerrr,",name)
    #             if (name == "read_rpma"):
    #                 session['click_read'] +=1
    #             elif (name == "write_rpma"):
    #                 session['click_write'] +=1
    #         else:
    #             pass
    # else:
    #     if(len(result) !=0):
    #         name, = result[0]
    #         print("name",name)
    #         if (name == "sync_read_rpma"):
    #             session['click_read'] +=1
    #         if (name == "sync_write_rpma"):
    #             session['click_write'] +=1
    #         if (name == "async_read_rpma"):
    #             session['click_read'] +=1
    #         if (name == "async_write_rpma"):
    #             session['click_write'] +=1
    #     else:
    #         pass
    

    redis = jsonify(result)
    return redis;
    


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


# @app.route('/stop_signal')
# def stop_refresh():
#     if (session['click_read'] == 20):
#         return 60
#     elif (session['click_write'] = 20):
#         return 60
#     session['click_read'] = 0
#     session['click_write'] = 0



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
    #app.run(debug=False)
    # thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/test_results/./rpma_fio_sh',))
    # thread.start()
    # print("start")
    app.run(host='0.0.0.0', port=3000)
    before_first_request()
