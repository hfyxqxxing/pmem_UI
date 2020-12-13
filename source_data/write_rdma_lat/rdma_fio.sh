client_conf_path="/home/xiaoran/fio/examples/rdmaio-client.fio"
server_conf_path="/home/xiaoran/fio/examples/rdmaio-server.fio"
server_host="10.239.85.78"
threads=(1 2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 32 34 36 38 40)
#threads=(1 2 4 6 8 16 24 32 40) 
#threads=(22 24 26 28 30 32 34 36 38 40 42 44 46)
#threads=(28 30 32 34 36 38 40 42 44 46 48)
depth=(1 2 4 6 8 10 16 24 32 40)

i=0
str=''

for td in `echo ${threads[*]}`
do
    str=''	
    let i=0
    time_now=0
    condition=$(ssh ${server_host} top -b -n 1 | grep fio | wc -L)
    if [ $condition != 0 ]
    then
    	ssh ${server_host} killall -9 fio
	echo "fio killed"
    fi
    sleep 1
    echo "------------------------>depth:${td}"
    ssh ${server_host}  numactl -N 0 ib_write_lat -s 4096 -d mlx5_0 -p 999  > "server_"${td}".log" &
    sleep 1
    numactl -N 0 ib_write_lat -s 4096  -F 192.168.0.1 -d mlx5_0 -p 999  > "client_"${td}".log" &
    sleep 5
    finish_flag=`tail -1 server_${td}.log | head -1`
    flag=${finish_flag:0:10}
    echo ${flag}
    echo "wait ${td} finished..."
    sleep 3
    printf "\n"
    echo "   "
    echo "-------show:"
    cat "client_"${td}".log" | tail -n 4 > "result_"${td}".log" & 
    echo "-------------------------end"
    echo "  "
    #sleep 1

done
