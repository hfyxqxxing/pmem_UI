$(document).ready(function () {
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

    $.ajax({
        url: "/mode_info",
        success: function (data) {
            document.getElementById("sys_mode").innerText = data;
        }
    });

    function memory() {
        $.ajax({
            url: "/memory_info",
            success: function (data) {
                var memory_num=0;
                var mode=document.getElementById("sys_mode").innerText;
                console.log(mode);
                if(mode=="AD_Mode" || mode=="Numa_Node"){
                    memory_num=4;
                }else{
                    memory_num=2;
                }
                console.log(memory_num)
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
                    for (var i = 0; i < memory_num; i++) {
                        var b = document.getElementById("PreviewGaugeMeter_" + i).getElementsByTagName("b");
                        b[1].innerText = "total:" + (data[0][i] / 1024).toFixed(2) + "G"
                        b[2].innerText = "used:" + ((data[0][i] - data[1][i]) / 1024).toFixed(
                            2) + "G"
                        $("#PreviewGaugeMeter_" + i).gaugeMeter({
                            percent: data[2][i]
                        });
                    }
                }
            }
        });
    }

    setInterval(memory, 1000);

    function getredis1() {
        redis_data = Math.random(0, 1000) * 10000
        return redis_data;
    }

    function createdata() {
        var series = new Array();
        var seriesdata = new Array(),
            time = (new Date()).getTime(),
            i;

        for (i = -19; i <= 0; i += 1) {
            var data = [];
            var t = time + i * 3000;
            var instance = getredis();
            for (var j = 0; j < instance.length; j++) {
                data.push({
                    x: t,
                    y: instance[j][0]
                });
            }
            seriesdata.push(data);
        }
        var seriesdatas = JSON.parse(JSON.stringify(seriesdata)) //deep copy
        for (m = 0; m < seriesdatas[0].length; m++) {
            var instance_data = [];
            var temp = []
            for (var n = 0; n < seriesdatas.length; n++) {
                temp.push(seriesdatas[n][m]);
            }
            instance_data["name"] = "instance" + m;
            instance_data["data"] = temp;
            series.push(instance_data);
        }
       // if(series!=""){
           // Highcharts.series=series;
            return series;
       // }else{
      //      return[{}];
      //  }     
    }

    function getredis() {
        var redis_data;
        $.ajax({
            url: "/redis_info",
            async: false,
            success: function (data) {
                redis_data = data;
                return redis_data;
            }
        });
        return redis_data;
    }

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });

    Highcharts.chart('container', {
        chart: {
            type: 'line',
            backgroundColor: '#272B30',
            // backgroundColor: 'rgba(0,0,0,0)',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
                load: function () {
                    // set up the updating of the chart each second
                    var series = this.series;
                    var loadData = function () {
                        $.ajax({
                            url: "/redis_info",
                            async: false,
                            success: function (data) {
                                console.log(series)
                                if (data.length != 0&& series.length!=0) {
                                    var qps=0;
                                   // var lastTime=0;
                                    console.log(series)
                                    var x = (new Date()).getTime();
                                    for (var k = 0; k < data.length; k++) {
                                        if (series[k].data.length > 0) {
                                            lastTime = series[k].data[
                                                series[k].data.length -
                                                1].x
                                        }
                                        if (x > lastTime) {
                                            series[k].addPoint([x, data[k][
                                                0]], true, true)
                                        }
                                        qps+=data[k][0];
                                    }
                                    document.getElementById("chart_qps").innerText = "average_qps: "+(qps/data.length).toFixed(2);
                                }
                            }
                        });
                    };
                    setInterval(loadData, 3000);
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
            text: null
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150,
            gridLineColor: '#283236',
            gridLineWidth: 1,
            lineColor: '#283236'
        },
        yAxis: {
            title: {
                text: 'QPS'
            },
            lineColor: '#283236',
            lineWidth: 1,
            gridLineColor: '#283236',
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            tickPositioner: function () {
                var positions = [],
                    tick = 0,
                    max = 0;                       
                if (this.dataMax <= 1000) {
                    //  max = (Math.floor(this.dataMax / 100) + 1) * 100;
                    max = (Math.floor(this.dataMax / 100) + 1) * 100 + Math.ceil((Math
                        .floor(this.dataMax / 100) + 1) / 4) * 100;
                } else if (this.dataMax > 1000 && this.dataMax <= 10000) {
                    //   max = (Math.floor(this.dataMax / 1000 + 1)) * 1000;
                    max = (Math.floor(this.dataMax / 1000) + 1) * 1000 + Math.ceil((Math
                        .floor(this.dataMax / 1000) + 1) / 4) * 1000;
                } else if (this.dataMax > 10000) {
                    //  max = (Math.floor(this.dataMax / 2000 + 1)) * 2000;
                    max = (Math.floor(this.dataMax / 2000) + 1) * 2000 + Math.ceil((Math
                        .floor(this.dataMax / 2000) + 1) / 4) * 2000;
                }
                increment = Math.ceil(max / 5);
                for (tick; tick <= max; tick += increment) {
                    positions.push(tick);
                }
                return positions;
            }
        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormat: '{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}'
        },
        legend: {
            enabled: true
        },
        exporting: {
            enabled: false
        },
        series: createdata()
    });
});
