
var mode_rdma = "readss"

// window.onload = function(){
//     $.ajax({
//         url: "/flush",
//         async: false,
//         success: function(data){
//             console.log("flush")
//             mode_rdma = data
//             console.log(mode_rdma);
            
//         }
//     });
// };

$(document).ready(function () {
    $.ajax({
        url: "/flush",
        async: false,
        success: function(data){
            console.log("flush")
            
        }
    });

    $.ajax({
            url:"/moding_rdma",
            async:false,
            dataType: "Text",
            success: function(data){mode_rdma = data}
        })

    console.log("reall change rdma", mode_rdma)



    function createdata() {

        // 通过mode判断数据线名称，格子都是一个。
        var series = new Array();
        var seriesdata = new Array();
        var rdma_moddes=["read_rdma","write_rdma"]

        var names = {"read_rdma": "Read_RDMA","write_rdma":"Write_RDMA"}

        var colors = {"read_rdma":"#f15c80","write_rdma":"#e4d354"}
        console.log(mode_rdma)
        if (mode_rdma=="compare"){
            var data = [];
            if (mode_rdma)
            var x0 = 0;
            var y0 = [];
            for (var s = 0; s < rdma_moddes.length; s++){
                item = [0];
                y0.push(item);
            }
            for (var i = 0; i < y0.length; i++) {
                data.push({
                    x: x0,
                    y: y0[i][0]
                });
            }
            console.log("here")
            console.log(data);
    
            seriesdata.push(data);
            var seriesdatas = JSON.parse(JSON.stringify(seriesdata)) //deep copy
            // m = 0,1,2,3
            for (m = 0; m < seriesdatas[0].length; m++) {
                var instance_data = [];
                var temp = []
                // n = 0
                for (var n = 0; n < seriesdatas.length; n++) {
                    temp.push(seriesdatas[n][m]);
                }
                instance_data["name"] = names[rdma_moddes[m]];
                instance_data["data"] = temp;
                instance_data["color"] = colors[rdma_moddes[m]]
                series.push(instance_data);
            }
            if (series.length!=0) {
                return series;
            } else {
                return [{}];
            }
            
        }
        else{
            console.log("come to ",mode_rdma)
            var data = [];
            if (mode_rdma)
            var x0 = 0;
            var y0 = [[0]];
            for (var i = 0; i < y0.length; i++) {
                data.push({
                    x: x0,
                    y: y0[i][0]
                });
            }
            console.log("here")
            console.log(data);
    
            seriesdata.push(data);
            var seriesdatas = JSON.parse(JSON.stringify(seriesdata)) //deep copy
            // m = 0
            for (m = 0; m < seriesdatas[0].length; m++) {
                var instance_data = [];
                var temp = []
                for (var n = 0; n < seriesdatas.length; n++) {
                    temp.push(seriesdatas[n][m]);
                }
                instance_data["name"] = names[mode_rdma];
                instance_data["data"] = temp;
                instance_data["color"] = colors[mode_rdma];
                series.push(instance_data);
            }
            if (series.length!=0) {
                return series;
            } else {
                return [{}];
            }
            
        } 



    }

   // qps_chart();

    var qps_chart_flag=false;
    var qps_interval=null;
    qps_chart();

    // function monitor_qps() {
    //     var redis_data;
    //     $.ajax({
    //         url: "/redis_info",
    //         async: false,
    //         success: function (data) {
    //             if(!qps_chart_flag && data.length!=0){
    //                 qps_chart();
    //                 qps_chart_flag=true;
    //             }else if(qps_chart_flag && data.length==0){
    //                 qps_chart();
    //                 qps_chart_flag=false;
    //                 document.getElementById("chart_qps").innerText="";
    //             }
    //         }           
    //     });
    // }

    // setInterval(qps_chart, QPS_time);

    Highcharts.setOptions({
        global: {
            useUTC: false
        },
        colors: ['#7cb5ec', '#90ed7d', '#f7a35c', '#8085e9', 
        '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'] 
    });

    function qps_chart() {
        qps_chart_flag=true;
        clearInterval(qps_interval);   
        if (mode_rdma == "compare"){
            var QPS_time = 500;
        }
        else{
            var QPS_time = 2000;
        }

        var what = Highcharts.chart('container2', {
            chart: {
                type: 'line',
                backgroundColor: '#272B30',
                // backgroundColor: 'rgba(0,0,0,0)',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function () {
                        // set up the updating of the chart each second
                        var series = this.series
                        var loadData = function () {
                            $.ajax({
                                url: "/redis_info_rdma",
                                async: false,
                                success: function (data) {
                                    //首先是单个名字mode读取
                                    var name = mode_rdma;
                                    console.log("times");
                                    console.log(series);

                                    //然后是情况的考虑,default 多条
                                    if (mode_rdma == "compare"){
                                        names = ["read_rdma","write_rdma"]
                                        if (data.length != 0 && series.length != 0) {
                                            // qps_chart_flag=true;
                                             for (var k = 0; k < series.length; k++) {
    
                                                 //x ,data[0]是因为jsonify多加了一层不知道什么的嵌套
                                                 //是个字典的集合，但是因为是字典的集合所以没有顺序没有名字？
                                                 console.log("what is ",data[k][names[k]][0])
                                                 var x = data[k][names[k]][0]
                                                 var lastTime = 0;
                                                 if (series[k].data.length > 0) {
                                                     lastTime = series[k].data[
                                                         series[k].data.length -
                                                         1].x
                                                 }
                                                 if (x > lastTime) {
                                                     //y
                                                     series[k].addPoint([x, data[k][names[k]][1]], true, false)
                                                 }
                                                 // qps += data[k]["bw"][1];
                                                 // console.log(qps)
                                             }
                                             // document.getElementById("chart_qps").innerText = "average_bw: " + (qps / series[0].length).toFixed(2)+"\xa0\xa0\xa0" + "GiB/s";
                                         }
                                    }
                                    else{
                                        if (data.length != 0 && series.length != 0) {
                                            // qps_chart_flag=true;
                                             for (var k = 0; k < series.length; k++) {
    
                                                 //x 
                                                 console.log("what is ",data[0])
                                                 var x = data[0][name][0]
                                                 var lastTime = 0;
                                                 if (series[k].data.length > 0) {
                                                     lastTime = series[k].data[
                                                         series[k].data.length -
                                                         1].x
                                                 }
                                                 if (x > lastTime) {
                                                     //y
                                                     series[k].addPoint([x, data[0][name][1]], true, false)
                                                 }
                                                 // qps += data[k]["bw"][1];
                                                 // console.log(qps)
                                             }
                                             // document.getElementById("chart_qps").innerText = "average_bw: " + (qps / series[0].length).toFixed(2)+"\xa0\xa0\xa0" + "GiB/s";
                                         }
                                    }


                                }
                            });
                        };
                       qps_interval= setInterval(loadData, QPS_time);
                    }
                }
            },
            credits: {
                enabled: false
            },

            time: {
                useUTC: false
            },

            title: {
                text: 'BW-threads',
                style: {
                    color: '#808080',
                    fontSize: '20px',
                }
            },

            xAxis: {
                title: {
                    text: 'Threads',
                    style: {
                        color: '#808080',
                        fontSize: '20px',
                    }
                },
                type: 'line',
                tickPixelInterval: 200,
                gridLineColor: '#373B40',
                gridLineWidth: 1,
                lineColor: '#373B40',
                labels: {
                    style: {
                        color: '#808080',
                        fontSize: '11px',
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'BW (GiB/s)',
                    style: {
                        color: '#808080',
                        fontSize: '20px',
                    }
                },
                lineColor: '#373B40',
                lineWidth: 1,
                gridLineColor: '#373B40',
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }],
                labels: {
                    style: {
                        color: '#808080',
                        fontSize: '11px',
                    }
                },
                tickPositioner: function () {
                    var positions = [],
                        tick = 0,
                        max = 0;
                    
                    max = (this.dataMax/100+this.dataMax/100)*100+((this.dataMax/100+this.dataMax/100)/4)*100;
                    // if (this.dataMax <= 1000) {
                    //     //  max = (Math.floor(this.dataMax / 100) + 1) * 100;
                    //     max = (Math.floor(this.dataMax / 100) + 1) * 100 + Math.ceil((Math
                    //         .floor(this.dataMax / 100) + 1) / 4) * 100;
                    // } else if (this.dataMax > 1000 && this.dataMax <= 10000) {
                    //     //   max = (Math.floor(this.dataMax / 1000 + 1)) * 1000;
                    //     max = (Math.floor(this.dataMax / 1000) + 1) * 1000 + Math.ceil((Math
                    //         .floor(this.dataMax / 1000) + 1) / 4) * 1000;
                    // } else if (this.dataMax > 10000) {
                    //     //  max = (Math.floor(this.dataMax / 2000 + 1)) * 2000;
                    //     max = (Math.floor(this.dataMax / 2000) + 1) * 2000 + Math.ceil((Math
                    //         .floor(this.dataMax / 2000) + 1) / 4) * 2000;
                    // }
                    // increment = Math.ceil(max / 5);
                    // for (tick; tick <= max; tick += increment) {
                    //     positions.push(tick);
                    // }
                    // return positions;
                }
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br/>',
                pointFormat: 'Threads: {point.x:.2f}<br/>Bind Width: {point.y:.2f} GiB/s'
            },
            legend: {
                enabled: true,
                itemStyle: {
                    color: '#808080',
                    fontSize: '11px',
                }
            },
            exporting: {
                enabled: false
            },
            series:createdata()
        });

        // window.onload = function(){
        //     $.ajax({
        //         url: "/flush",
        //         success: function(data){
        //             console.log("flush")
        //             mode_rdma = data
        //             console.log(mode_rdma);
        //             var them = what.series

        //         }
        //     });
        // };
    }

   //  document.getElementById("stop-server").onclick=function(){
     //   console.log(111)
     //   $.ajax({
    //        url: "/stop_server",
      //      async: false,
        //    success: function (data) {
               // alert(data)
          //  }
      //  });
   // }

   // document.getElementById("run-test").onclick=function(){
     //   $.ajax({
       //     url: "/run_test",
         //   async: false,
           // success: function (data) {
             //   alert(data)
          //  }
      //  });
   // }


});


