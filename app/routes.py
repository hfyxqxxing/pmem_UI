# -*- coding: utf-8 -*-
from flask import Flask, render_template, request,session,current_app
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
    # g.username = 0


@app.route('/')
def index():
    modes= DCPMM_Mode1();
    if modes=="AD_Mode" or modes=="Numa_Node":
        sys_info = get_sys_info()
        return render_template('index_ad.html',sys_info);
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

@app.route('/flush')
def clear():
    session['click'] = 0
    return "yes"


@app.route('/memory_info')
def load_memory():
    memory =jsonify(DCPMM_Capacity());
   # memory =jsonify([10,20,30,40]);
    return memory;

@app.route('/redis_info')
def load_redis():
    click = session['click']
    print(click)
    if click == 0:
        time.sleep(3)
    result = get_data(click)
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
    app.run(host='0.0.0.0', port=3000)
    before_first_request()
