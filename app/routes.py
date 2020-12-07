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
    session['click'] = 0
    session['mode'] = "default"
    # g.username = 0


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
        return render_template('index_ad.html',sys_info=sys_info);
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

@app.route('/moding',methods=['GET','POST'])
def the_mode():
    print("man",session['mode'])

    return session['mode']


@app.route('/flush')
def clear():
    session['click'] = 0
    print("mode", session['mode'])
    return session['mode']

@app.route('/selection', methods=['GET','POST'])
def one():

    session['mode'] = request.form.get("mode")
    print("go_to",session['mode'])
    return redirect('/')

@app.route('/memory_info')
def load_memory():
    memory =jsonify(DCPMM_Capacity());
   # memory =jsonify([10,20,30,40]);
    return memory;

@app.route('/redis_info')
def load_redis():
    click = session['click']
    mode = session['mode']
    print("click: ",click)
    print("show mode: ",mode)
    if click == 0:
        time.sleep(3)
    result = get_data(click,mode)
    if (click > 20 ):
        click = 20
    redis = jsonify(result)
    if (len(result) != 0):
        print(len(result))
        session['click'] +=1
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
    #app.run(debug=False)
    # thread = threading.Thread(target=os.system,args=('/home/xiaoran/fio/test_results/./rpma_fio_sh',))
    # thread.start()
    # print("start")
    app.run(host='0.0.0.0', port=3000,debug=True)
    before_first_request()
