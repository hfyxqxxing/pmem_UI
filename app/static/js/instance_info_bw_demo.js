
var mode = "default"
var timesrun = 0
var chart_bw
var chart_lat
var loading = null


$(document).ready(function () {
    // $.ajax({
    //     url: "/flush",
    //     async: false,
    //     success: function(data){
    //         console.log("flush")
    //         console.log(mode);
            
    //     }
    // });

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

    var names = {"read_rpma":"read_rdma",
    "write_rpma":"write_rdma",}

    var colors = {"read_rpma":"#f7a35c",
    "write_rpma":"#f7a35c",
    "default":"#808080",
    "read_rdma":"#90ed7d",
    "write_rdma":"#90ed7d"}


    //nvme #7cb5ec

    console.log(mode)
    var data = [];
    var time = (new Date()).getTime();
    var t = time;

    // 非重绘的建立初始坐标
    var y0 = undefined;
    for (i = 0; i<3 ; i++){
        data.push({
            x: t,
            y: y0
        });

    }

    //重绘建立多个坐标

    console.log("here")
    console.log(data);
    // debugger
    seriesdata.push(data);
    var seriesdatas = JSON.parse(JSON.stringify(seriesdata)) //deep copy
    console.log(seriesdatas)
    // m = 0,1,2,3
    // for (m = 0; m < seriesdatas[0].length; m++) {
    var instance_data = [];
    var temp = []
    // n = 0
    for (var n = 0; n < seriesdatas.length; n++) {
        temp.push(seriesdatas[n][0]);
    }
    console.log("this is ",temp)
    console.log(mode)
    console.log(colors[mode])
    instance_data["name"] = mode;
    instance_data["data"] = temp;
    instance_data["color"] = colors[mode]
    // instance_data["symbol"] = "none";
    // instance_data.data['marker']={"enabled":false}
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
        //这里是顺序没对上的罪魁祸首，要改，在这里改

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
    console.log("111,",series)
    // }
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

    
    var names = {"read_rpma":"read_rdma",
    "write_rpma":"write_rdma",}


    var colors = {"read_rpma":"#f7a35c","write_rpma":"#f7a35c","default":"#808080",
    "read_rdma":"#90ed7d",
    "write_rdma":"#90ed7d"}
    console.log(mode)
    var data = [];
    var time = (new Date()).getTime();
    var t = time;
    var y0 = undefined;
    for (i = 0; i<2 ; i++){
        data.push({
            x: t,
            y: y0
        });

    }

    //重绘建立多个坐标

    console.log("here")
    console.log(data);
    // debugger
    seriesdata.push(data);
    var seriesdatas = JSON.parse(JSON.stringify(seriesdata)) //deep copy
    console.log(seriesdatas)
    // m = 0,1,2,3
    // for (m = 0; m < seriesdatas[0].length; m++) {
    var instance_data = [];
    var temp = []
    // n = 0
    for (var n = 0; n < seriesdatas.length; n++) {
        temp.push(seriesdatas[n][0]);
    }
    console.log("this is ",temp)
    console.log(mode)
    console.log(colors[mode])
    instance_data["name"] = mode;
    instance_data["data"] = temp;
    instance_data["color"] = colors[mode]
    // instance_data["symbol"] = "none";
    // instance_data.data['marker']={"enabled":false}
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
        instance_data2["dashStyle"] = "longdash"
        // instance_data2["type"] = "do";
        instance_data2["color"] = colors[names[mode]]
        //一个instance_data是一条线的东西
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
    console.log("111,",series)
    // }
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
            type: 'spline',
            backgroundColor: '#272B30',
            // backgroundColor: 'rgba(0,0,0,0)',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            style:{
                float:"right"
            }
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
            type: 'spline',
            backgroundColor: '#272B30',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            // events: {
            //     load: function () {
            //         // set up the updating of the chart each second
            //         var series = this.series
            //         var loadData = function () {
            //             $.ajax({
            //                 url: "/redis_info",
            //                 async: false,
            //                 success: function (data) {
            //                 }
            //             });
            //         };
            //        qps_interval= setInterval(loadData, QPS_time);
            //     }
            // }
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
    console.log(chart_bw.series);
    // debugger
    // chart_bw.series[0]=createdata()
    // chart_lat.series[0]=createdata2()
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
    console.log("creats",createdata())

    //这里需要多次for重复添加series
    //for
    chart_bw.addSeries(createdata()[0])
    chart_bw.addSeries(createdata()[1])
    chart_bw.addSeries(createdata()[2])

    //[0],[1]...
    console.log(chart_bw.series)
    chart_lat.addSeries(createdata2()[0])
    chart_lat.addSeries(createdata2()[1])
    chart_lat.addSeries(createdata2()[2])
    clearInterval(loading)
    // // loadIn();
    loading = setInterval(loadIn,5500);
}


var tt = null;
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
    // var timing = null
    
    console.log("reachedededdede")
    fresh()
    tt = setInterval(fresh,360000)
}


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

                    // for (var k = 0; k < series.length; k++) {
                    console.log("all",data)
                    console.log(series[0].name)
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
                    console.log(series[0].name)
                    nvme_data={"read_rpma":[182.1,11.01],
                            "write_rpma":[85.5,11.49]}
                    if (series[0].name == "default"){
                        series[0].addPoint([x, data[mode][1]], true, false)
                    }
                    else{
                        series[2].addPoint([x, data[mode][1],data[mode][2]], true, false)
                        series[1].addPoint([x,data[names[mode]][1]], true, false)
                        series[0].addPoint([x,nvme_data[mode][1]], true, false)
                    }
                   
                    if (series_2[0].name == "default"){
                        series_2[0].addPoint([x, data[mode][0]], true, false)
                    }
                    else{
                        series_2[2].addPoint([x, data[mode][0]], true, false)
                        series_2[1].addPoint([x,data[names[mode]][0]], true, false)
                        series_2[0].addPoint([x,nvme_data[mode][0]], true, false)
                    }
                        //  }
                    
                    //传不到值，传歪zhi
                    $("#dram_bw").text(data[names[mode]][1])
                    $("#rpma_bw").text(data[mode][1])
                    $("#dram_lat").text(data[names[mode]][0])
                    $("#rpma_lat").text(data[mode][0])
                    $('#nvme_lat').text(nvme_data[mode][0])
                    $('#nvme_bw').text(nvme_data[mode][1])
                    $('.rpma_threads').text(data[mode][2])

                    // }
                    // document.getElementById("chart_qps").innerText = "average_bw: " + (qps / series[0].length).toFixed(2)+"\xa0\xa0\xa0" + "GiB/s";
                }
            }

        }
    });
//    qps_interval= setInterval(loadData, QPS_time);
}