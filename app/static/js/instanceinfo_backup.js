
var mode = "default"
var timesrun = 0
var chart_bw
var chart_lat

$(document).ready(function () {
    $.ajax({
        url: "/flush",
        async: false,
        success: function(data){
            console.log("flush")
            console.log(mode);
            
        }
    });

    $.ajax({
            url:"/moding",
            async:false,
            dataType: "Text",
            success: function(data){mode = data}
        })

    console.log("reall change", mode)

    //GaugeMeter
    $(".GaugeMeter").gaugeMeter();



    //Format Code
    $("pre.Code").html(function (index, html) {
        return html.replace(/^(.*)$/mg, "<span class='Line'>$1</span>")
    });

    //Sticky Table Header
    var tables = $("table.StickyHeader");
    tables.each(function (i) {
        var table = tables[i];
        var theadClone = $(table).find("thead").clone(true);
        var stickyHeader = $("<div></div>").addClass("StickyHeader Hide");
        stickyHeader.append($("<table></table")).find("table").append(theadClone);
        $(table).after(stickyHeader);

        var tableHeight = $(table).height();
        var tableWidth = $(table).width() + Number($(table).css("padding-left").replace(/px/ig,
            "")) + Number($(table).css("padding-right").replace(/px/ig, "")) + Number($(
                table).css("border-left-width").replace(/px/ig, "")) + Number($(table).css(
                    "border-right-width").replace(/px/ig, ""));

        var headerCells = $(table).find("thead th");
        var headerCellHeight = $(headerCells[0]).height();
        var no_fixed_support = false;
        if (stickyHeader.css("position") == "Absolute") {
            no_fixed_support = true;
        }

        var stickyHeaderCells = stickyHeader.find("th");
        stickyHeader.css("width", "100%");

        var cellWidth = $(headerCells[0]).width() + 1;
        $(stickyHeaderCells[0]).attr("style", "width:" + cellWidth + "px !important");

        var cutoffTop = $(table).offset().top;
        var cutoffBottom = tableHeight + cutoffTop - headerCellHeight;

        $(window).scroll(function () {
            var currentPosition = $(window).scrollTop();
            if (currentPosition > cutoffTop && currentPosition < cutoffBottom) {
                stickyHeader.removeClass("Hide");
                if (no_fixed_support) {
                    stickyHeader.css("top", currentPosition + "px");
                }
            } else {
                stickyHeader.addClass("Hide");
            }
        });
    });

    setInterval(memory, 2000);


    setTimeout(qps_chart(),1); 
    qps_chart_2();  

}); 

function memory() {
    $.ajax({
        url: "/memory_info",
        success: function (data) {
            var memory_num = 0;
          //  var mode = document.getElementById("sys_mode").innerText;
            var mode="1LM"
            if (mode == "AD_Mode" || mode == "Numa_Node") {
                memory_num = 4;
            } else {
                memory_num = 2;
            }
            if (mode == "Numa_Node") {
                var b = document.getElementById("PreviewGaugeMeter_" + 0).getElementsByTagName("b");
                b[1].innerText = "total:" + (data[0][0] / 1024).toFixed(2) + "G"
                b[2].innerText = "used:" + ((data[0][0] - data[1][0]) / 1024).toFixed(
                    2) + "G"
                $("#PreviewGaugeMeter_" + 0).gaugeMeter({
                    percent: data[2][0]
                });
                var b = document.getElementById("PreviewGaugeMeter_" + 1).getElementsByTagName("b");
                b[1].innerText = "total:" + (data[0][2] / 1024).toFixed(2) + "G"
                b[2].innerText = "used:" + ((data[0][2] - data[1][2]) / 1024).toFixed(
                    2) + "G"
                $("#PreviewGaugeMeter_" + 1).gaugeMeter({
                    percent: data[2][2]
                });
                var b = document.getElementById("PreviewGaugeMeter_" + 2).getElementsByTagName("b");
                b[1].innerText = "total:" + (data[0][1] / 1024).toFixed(2) + "G"
                b[2].innerText = "used:" + ((data[0][1] - data[1][1]) / 1024).toFixed(
                    2) + "G"
                $("#PreviewGaugeMeter_" + 2).gaugeMeter({
                    percent: data[2][1]
                });
                var b = document.getElementById("PreviewGaugeMeter_" + 3).getElementsByTagName("b");
                b[1].innerText = "total:" + (data[0][3] / 1024).toFixed(2) + "G"
                b[2].innerText = "used:" + ((data[0][3] - data[1][3]) / 1024).toFixed(
                    2) + "G"
                $("#PreviewGaugeMeter_" + 3).gaugeMeter({
                    percent: data[2][3]
                });
            } else {
                console.log("reach hereeee")
                //cpu
                var b = document.getElementById("PreviewGaugeMeter_" + 0).getElementsByTagName("b");
                b[1].innerText = data[0][0]
                b[2].innerText = " "
                $("#PreviewGaugeMeter_" + 0).gaugeMeter({
                    percent: data[2][0]
                });

                //dram
                var b = document.getElementById("PreviewGaugeMeter_" + 1).getElementsByTagName("b");
                b[1].innerText = "total:" + (data[0][1] / 1024).toFixed(2) + "G"
                b[2].innerText = "used:" + ((data[0][1] - data[1][1]) / 1024).toFixed(
                    2) + "G"
                $("#PreviewGaugeMeter_" + 1).gaugeMeter({
                    percent: data[2][1]
                });


                //aep
                var b = document.getElementById("PreviewGaugeMeter_" + 2).getElementsByTagName("b");
                b[1].innerText = "total:" + (data[0][2] / 1024).toFixed(2) + "G"
                b[2].innerText = "used:" + ((data[0][2] - data[1][2]) / 1024).toFixed(
                    2) + "G"
                $("#PreviewGaugeMeter_" + 2).gaugeMeter({
                    percent: data[2][2]
                });


            }
        }
    });
}

function createdata() {

    // 通过mode判断数据线名称，格子都是一个。
    var series = new Array();
    var seriesdata = new Array();
    var rpma_modes=["read_rpma","write_rpma"]

    var names = {"read_rpma":"read_rpma",
    "write_rpma":"write_rpma",}

    var colors = {"read_rpma":"#7cb5ec",
    "write_rpma":"#90ed7d",
    "default":"#808080"}
    console.log(mode)
    var data = [];
    var time = (new Date()).getTime();
    var t = time;

    // 非重绘的建立初始坐标
    var y0 = [null];
    data.push({
        x: t,
        y: y0
    });

    //重绘建立多个坐标

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
        instance_data["name"] = mode;
        instance_data["data"] = temp;
        instance_data["color"] = colors[mode]
        series.push(instance_data);
    }
    if (series.length!=0) {
        return series;
    } else {
        return [{}];
    }
        

}

function createdata2() {

    // 通过mode判断数据线名称，格子都是一个。
    var series = new Array();
    var seriesdata = new Array();
    var rpma_moddes=["read_rpma","write_rpma"]

    var names = {"read_rpma": "Read_rpma","write_rpma":"Write_rpma"}

    var colors = {"read_rpma":"#f15c80","write_rpma":"#e4d354","default":"#808080"}
    console.log(mode)
    var data = [];
    var time = (new Date()).getTime();
    var t = time;
    var y0 = [0];
    for (var i = 0; i < y0.length; i++) {
        data.push({
            x: t,
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
        instance_data["name"] = mode;
        instance_data["data"] = temp;
        instance_data["color"] = colors[mode]
        series.push(instance_data);
    }
    if (series.length!=0) {
        return series;
    } else {
        return [{}];
    }
    
    
}

function qps_chart_2() {
    qps_chart_flag=true;
    qps_interval2=null
    clearInterval(qps_interval2);   
    var QPS_time = 5000;

    chart_lat = Highcharts.chart('container2', {
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
                    var loadData2 = function () {
                        $.ajax({
                            url: "/redis_info",
                            async: false,
                            success: function (data) {
                                //首先是单个名字mode读取
                                var name = mode;
                                console.log("times");
                                console.log(series);

                                //然后是情况的考虑,default 多条
                                if (data.length != 0 && series.length != 0) {
                                    // qps_chart_flag=true;
                                    for (var k = 0; k < series.length; k++) {
                                        console.log(series[k].name)
                                        console.log(data)
                                        console.log(data[0])
                                        console.log(data[mode][0])
                                        //现在四个还是四个元素，有名，无值
                                        //x ,data[0]是因为jsonify多加了一层不知道什么的嵌套
                                        //是个字典的集合，但是因为是字典的集合所以没有顺序没有名字？
                                        console.log("what is bw",data[mode][1])
                                        var x = (new Date()).getTime()
                                        // var x = data[k][names[k]][0]
                                        // var lastTime = 0;
                                        // if (series[k].data.length > 0) {
                                        //     lastTime = series[k].data[
                                        //         series[k].data.length -
                                        //         1].x
                                        // }
                                        //  if (x > lastTime) {
                                        //      //y
                                        series[k].addPoint([x, data[mode][0]], true, false)
                                        //  }
                                    
                                        // qps += data[k]["bw"][1];
                                        // console.log(qps)
                                    }
                                    // document.getElementById("chart_qps").innerText = "average_bw: " + (qps / series[0].length).toFixed(2)+"\xa0\xa0\xa0" + "GiB/s";
                                }
                            }
                        });
                    };
                   qps_interval2= setInterval(loadData2, QPS_time);
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
            text: 'Latency',
            style: {
                color: '#808080',
                fontSize: '20px',
            }
        },

        xAxis: {
            title: {
                text: 'Time',
                style: {
                    color: '#808080',
                    fontSize: '20px',
                }
            },
            type: 'datetime',
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
                text: 'Latency (usec)',
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

            }
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormat: 'Latency: {point.y:.2f} usec'
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
        series:createdata2()
    });

}




Highcharts.setOptions({
    global: {
        useUTC: false
    },
    colors: ['#7cb5ec', '#90ed7d', '#f7a35c', '#8085e9', 
    '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'] 
});




function qps_chart() {
    qps_chart_flag=true;
    var qps_interval=null;
    clearInterval(qps_interval);   
    var QPS_time = 5000;

    chart_bw = Highcharts.chart('container', {
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
                            url: "/redis_info",
                            async: false,
                            success: function (data) {
                                //首先是单个名字mode读取
                                var name = mode;
                                console.log("times");
                                console.log(series);
                                if (!data){
                                    var x = (new Date()).getTime();
                                    series[k].addPoint([x, [null], true, false]);
                                }else{

                                    // names = ["read_rpma","write_rpma"]
                                    if (data.length != 0 && series.length != 0) {
                                        // qps_chart_flag=true;
                                        for (var k = 0; k < series.length; k++) {
                                            console.log(series[k].name)
                                            console.log(data)
                                            console.log(data[0])
                                            console.log(mode)
                                            console.log(data[mode][0])

                                            console.log("what is latency",data[mode][0])
                                            var x = (new Date()).getTime()
                                            // var x = data[k][names[k]][0]
                                            // var lastTime = 0;
                                            // if (series[k].data.length > 0) {
                                            //     lastTime = series[k].data[
                                            //         series[k].data.length -
                                            //         1].x
                                            // }
                                            //  if (x > lastTime) {
                                            //      //y
                                            series[k].addPoint([x, data[mode][1]], true, false)
                                            //  }
                                        
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
            text: 'BW',
            style: {
                color: '#808080',
                fontSize: '20px',
            }
        },

        xAxis: {
            title: {
                text: 'Time',
                style: {
                    color: '#808080',
                    fontSize: '20px',
                },
            },
            type: 'datetime',
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

            }
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormat: 'Bind Width: {point.y:.2f} GiB/s'
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


}


// $("#read").click(function(){
//     $.ajax({
//         url:"/test_post",
//         type:"post",
//         dataType:"json" ,
//         data:'{"name":"mode","value":"rpma_read"}',
//         success:function(data){
//             console.log(data)
//         }
//     })
//     console.log("right")
//     console.log($("#read").attr('value'))
// })

function fresh(){
    console.log("got me")
    chart_bw.series[0].remove(true);
    chart_lat.series[0].remove(true);
    $.ajax({
        url:"/refresh",
        async:false,
        success:function(data){
            console.log(data)
        }
    })
    $.ajax({
        url:"/moding",
        async:false,
        dataType: "Text",
        success: function(data){mode = data}
    })
    qps_chart()
    qps_chart_2()
}

$("#read").click(function(){
    var timing = null
    clearInterval(timing)
    console.log("reachedededdede")
    fresh()
    // timing = setInterval(fresh,30000)
    

});
