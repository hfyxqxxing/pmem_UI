
var mode = "default"
var timesrun = 0
var chart_bw
var chart_lat
var loading = null
var tt = null;

$(document).ready(function () {

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
    loadIn();
    loading = setInterval(loadIn,5000);

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

            console.log("reach hereeee")
            //cpu
            var b = document.getElementById("PreviewGaugeMeter_" + 0).getElementsByTagName("b");
            b[1].innerText = data[0][0]
            b[2].innerText = " "
            $("#PreviewGaugeMeter_" + 0).gaugeMeter({
                percent: data[2][0]
            });

            //dram
            // var b = document.getElementById("PreviewGaugeMeter_" + 1).getElementsByTagName("b");
            // b[1].innerText = "total:" + (data[0][1] / 1024).toFixed(2) + "G"
            // b[2].innerText = "used:" + ((data[0][1] - data[1][1]) / 1024).toFixed(
            //     2) + "G"
            // $("#PreviewGaugeMeter_" + 1).gaugeMeter({
            //     percent: data[2][1]
            // });


            // //aep
            // var b = document.getElementById("PreviewGaugeMeter_" + 2).getElementsByTagName("b");
            // b[1].innerText = "total:" + (data[0][2] / 1024).toFixed(2) + "G"
            // b[2].innerText = "used:" + ((data[0][2] - data[1][2]) / 1024).toFixed(
            //     2) + "G"
            // $("#PreviewGaugeMeter_" + 2).gaugeMeter({
            //     percent: data[2][2]
            // });

        }
    });
}

function createdata() {

    // 通过mode判断数据线名称，格子都是一个。
    var series = new Array();
    var seriesdata = new Array();
    var rpma_modes=["read_rpma","write_rpma"]

    var names = {"read_rpma":"read_rdma",
    "write_rpma":"write_rdma",}

    var colors = {"read_rpma":"#f7a35c",
    "write_rpma":"#f7a35c",
    "default":"#808080",
    "read_rdma":"#90ed7d",
    "write_rdma":"#90ed7d"}



    console.log(mode)
    var data = [];
    var time = (new Date()).getTime();
    var t = time;

    // 建立初始坐标
    var y0 = undefined;
    for (i = 0; i<3 ; i++){
        data.push({
            x: t,
            y: y0
        });

    }


    console.log("here")
    console.log(data);
    // debugger
    seriesdata.push(data);
    var seriesdatas = JSON.parse(JSON.stringify(seriesdata)) //deep copy
    console.log(seriesdatas)



    // 版本需要，每次建立三条线，需要三个instance_data. 可以通过再写函数进行区分。
    var instance_data = [];
    var temp = []

    for (var n = 0; n < seriesdatas.length; n++) {
        temp.push(seriesdatas[n][0]);
    }
    console.log("this is ",temp)
    console.log(mode)
    console.log(colors[mode])
    instance_data["name"] = mode;
    instance_data["data"] = temp;
    instance_data["color"] = colors[mode]
    var instance_data2 = [];
    var instance_data3 = [];

    if (mode != "default"){
        
        var temp2 = []
        // n = 0
        for (var n = 0; n < seriesdatas.length; n++) {
            temp2.push(seriesdatas[n][1]);
        }
        console.log("this is ",temp2)
        console.log(mode)
        console.log(colors[mode])
        instance_data2["name"] = names[mode];
        instance_data2["data"] = temp2;
        instance_data2["dashStyle"] = "longdash";
        instance_data2["color"] = colors[names[mode]]
        //一个instance_data是一条线的东西\


        var temp3 = []
        // n = 0
        for (var n = 0; n < seriesdatas.length; n++) {
            temp3.push(seriesdatas[n][2]);
        }
        console.log("this is ",temp3)
        console.log(mode)
        console.log(colors[mode])
        instance_data3["name"] = "nvme";
        instance_data3["data"] = temp3;
        instance_data3["dashStyle"] = "longdash";
        instance_data3["color"] = "#7cb5ec";

        series.push(instance_data3);
        series.push(instance_data2);
    }
    series.push(instance_data);
    //push 的顺序影响series里的顺序，删除后重新添加的时候会影响调用

    console.log("111,",series)
    // }
    if (series.length!=0) {
        return series;
    } else {
        return [{}];
    }
        

}



// nou used(maybe)
Highcharts.setOptions({
    global: {
        useUTC: false
    },
    colors: ['#7cb5ec', '#90ed7d', '#f7a35c', '#8085e9', 
    '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'] 
});


// create the "container" chart, the position in the index_demo.html
function qps_chart() {
    qps_chart_flag=true; 

    chart_bw = Highcharts.chart('container', {
        // 类型，左右缩进
        chart: {
            type: 'spline',
            backgroundColor: '#272B30',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            marginLeft: 100,
        },
        credits: {
            enabled: false
        },

        time: {
            useUTC: false
        },

        title: {
            text: 'Bind Width (GiB/s)',
            style: {
                color: '#808080',
                fontSize: '20px',
            }
        },
        // 时间类型的x轴坐标， type
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
            // y轴的刻度范围
            tickPositioner: function () {
                max = (this.dataMax/100+this.dataMax/100)*100+((this.dataMax/100+this.dataMax/100)/4)*100;
            }
        },
        // 鼠标移动浮现的气泡
        tooltip: {
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormat: 'Bind Width: {point.y:.2f} GiB/s'
        },

        legend: {
            enabled: true,
            itemStyle: {
                color: '#808080',
                fontSize: '20px',
            }
        },
        exporting: {
            enabled: false
        },
        plotOptions:{
            series:{
                // 去掉数据线上圆点
                marker:{
                    enabled:false
                }
            }
        },
        series:createdata()
    });

}

// create the "container2" chart, the position in the index_demo.html
function qps_chart_2() {
    qps_chart_flag=true;
    qps_interval2=null
    clearInterval(qps_interval2);   
    var QPS_time = 5000;

    chart_lat = Highcharts.chart('container2', {
        chart: {
            type: 'spline',
            backgroundColor: '#272B30',
            // backgroundColor: 'rgba(0,0,0,0)',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            marginLeft: 100,

        },
        credits: {
            enabled: false
        },

        time: {
            useUTC: false
        },

        title: {
            text: 'Latency (usec)',
            style: {
                color: '#808080',
                fontSize: '20px',
                type:'bold'
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
            type:"logarithmic",
            floor:0,
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
            pointFormat: 'Latency: {point.y:.2f} usec',
            style:'20px'
        },
        legend: {
            enabled: true,
            itemStyle: {
                color: '#808080',
                fontSize: '20px',
            }
        },
        exporting: {
            enabled: false
        },
        plotOptions:{
            series:{
                marker:{
                    enabled:false
                }
            }
        },
        series:createdata()
    });

}


// 重置页面
function fresh(){
    console.log("got me")
    console.log(chart_bw.series);
    chart_bw.series[0].remove(true);
    chart_lat.series[0].remove(true);
    if (mode != "default"){
        chart_bw.series[0].remove(true);
        //for nvme line
        chart_bw.series[0].remove(true);
        chart_lat.series[0].remove(true);
        chart_lat.series[0].remove(true);
    }

    $("#dram_bw").text(0)

    $("#rpma_bw").text(0)

    $("#dram_lat").text(0)
    $("#rpma_lat").text(0)
    $('.rpma_threads').text(0)
    $('#nvme_lat').text(0)

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

    $("#name_lat").text(mode+"_lat(usec)")
    $("#name_th").text(mode+"_threads")

    // 待优化
    chart_bw.addSeries(createdata()[0])
    chart_bw.addSeries(createdata()[1])
    chart_bw.addSeries(createdata()[2])

    console.log(chart_bw.series)
    chart_lat.addSeries(createdata()[0])
    chart_lat.addSeries(createdata2()[1])
    chart_lat.addSeries(createdata2()[2])

    // 定时器需要清除以防前后定时器互相干涉
    clearInterval(loading)
    loading = setInterval(loadIn,5500);
}


//按钮触发
function select(val){
    console.log(val)
    clearInterval(tt)
    $.ajax({
        url: "/choose",
        async: false,
        type:"GET",
        data:"mode="+val,
        dataType:'json',
        success: function (data) {
            console.log("get")
        }
    })
    if (val == "read_rpma"){
        document.getElementById("read").style.color="rgb(235, 125, 22)"
        document.getElementById("write").style.color="#808080"
    }
    if (val == "write_rpma"){
        document.getElementById("write").style.color="rgb(241, 148, 8)"
        document.getElementById("read").style.color="#808080"
    }

    
    console.log("reachedededdede")
    fresh()
    tt = setInterval(fresh,60000)
}

//加入数据点
function loadIn(){
    // set up the updating of the chart each second
    console.log("got")
    var series = chart_bw.series
    console.log("222",series)
    var series_2 = chart_lat.series
    $.ajax({
        url: "/redis_info",
        async: false,
        success: function (data) {

            var name = mode;
            console.log("mode",mode)
            console.log("times");
            console.log(series);

            //返回null值，现在没有了
            if (!data){
                var x = (new Date()).getTime();
                series[k].addPoint([x, null, true, false]);
            }else{

                names = {"read_rpma":"read_rdma","write_rpma":"write_rdma"}
                if (data.length != 0 && series.length != 0) {   

                    // console.log("all",data)
                    // console.log(series[0].name)
                    // console.log(data)
                    // console.log(data[0])
                    // console.log(mode)
                    // console.log(data[mode][0])
                    

                    console.log("what is latency",data[mode][0])
                    var x = (new Date()).getTime()
                        // var x = data[k][names[k]][0]
                        // var lastTime = 0;
                        // if (series[k].data.length > 0) {
                        //     lastTime = series[k].data[
                        //         series[k].data.length -
                        //         1].x
                        // }
                    console.log(series[0].name)
                    nvme_data={"read_rpma":[182.1,11.01],
                            "write_rpma":[85.5,11.49]}
                    if (series[0].name == "default"){
                        series[0].addPoint([x, data[mode][1]], true, false)
                    }
                    else{
                        series[0].addPoint([x, data[mode][1]], true, false)
                        series[2].addPoint([x, data[mode][1],data[mode][2]], true, false)
                        series[1].addPoint([x,data[names[mode]][1]], true, false)
                        series[0].addPoint([x,nvme_data[mode][1]], true, false)
                    }
                   
                    if (series_2[0].name == "default"){
                        series_2[0].addPoint([x, data[mode][0]], true, false)
                    }
                    else{
                        series_2[0].addPoint([x, data[mode][0]], true, false)
                        series_2[2].addPoint([x, data[mode][0]], true, false)
                        series_2[1].addPoint([x,data[names[mode]][0]], true, false)
                        series_2[0].addPoint([x,nvme_data[mode][0]], true, false)
                    }
                        //  }
                    

                    $("#dram_bw").text(data[names[mode]][1])
                    $("#rpma_bw").text(data[mode][1])
                    $("#dram_lat").text(data[names[mode]][0])
                    if (data[mode][0] == 1){
                        $("#rpma_lat").text(0)
                    }
                    else{
                        $("#rpma_lat").text(data[mode][0])                        
                    }
                    $('#nvme_lat').text(nvme_data[mode][0])
                    $('#nvme_bw').text(nvme_data[mode][1])
                    $('.rpma_threads').text(data[mode][2])

                }
            }

        }
    });
}