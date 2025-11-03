$(function() {
    "use strict";
    $('.counter').counterUp({
        delay: 10,
        time: 1000
    });
});

// UNIVERSITY REPORT
if (jQuery("#apex-chart-line-column").length) {
    var options = {
        chart: {
            height: 300,
            type: 'line',
            stacked: false,
            toolbar: {
                show: false,
            },
        },
        series: [{
            name: 'Fees',
            type: 'column',
            data: [30, 25, 22, 27, 48, 42, 70, 35, 40, 30, 25]
        }, {
            name: 'Donation',
            type: 'area',
            data: [40, 55, 42, 58, 52, 75, 57, 45, 65, 45, 50]
        }, {
            name: 'Income',
            type: 'line',
            data: [30, 25, 36, 30, 40, 35, 64, 52, 59, 36, 39]
        }],
        colors: ['#6435c9', '#45aaf2', '#5a67d8'],
        stroke: {
            width: [0, 2, 5],
            curve: 'smooth'
        },
        plotOptions: {
            bar: {
                columnWidth: '45%'
            }
        },
        fill: {
            opacity: [1, 0.1, 1],
            gradient: {
                inverseColors: false,
                shade: 'light',
                type: "vertical",
                opacityFrom: 0.85,
                opacityTo: 0.55,
                stops: [0, 100, 100, 100]
            }
        },
        labels: ['08/01/2024', '08/02/2024', '08/03/2024', '08/04/2024', '08/05/2024', '08/06/2024', '08/07/2024', '08/08/2024', '08/09/2024', '08/10/2024', '08/11/2024' ],
        markers: {
            size: 0
        },
        xaxis: {
            type: 'datetime'
        },
        grid: {
            borderColor: '#eef3f1'
        }
    };
    var chart = new ApexCharts(document.querySelector("#apex-chart-line-column"), options);
    chart.render();
}

// RADAR MULTIPLE SERIES
$(document).ready(function() {
    var options = {
        chart: {
            height: 348,
            type: 'radar',
            dropShadow: {
                enabled: true,
                blur: 1,
                left: 1,
                top: 1
            }
        },
        colors: ['#5a67d8', '#6435c9', '#45aaf2'],
        series: [{
            name: 'Sales',
            data: [80, 50, 30, 40, 100, 20],
        }, {
            name: 'Income',
            data: [20, 30, 40, 80, 20, 80],
        }, {
            name: 'Expense',
            data: [44, 76, 78, 13, 43, 10],
        }],
        stroke: {
            width: 0
        },
        fill: {
            opacity: 0.4
        },
        markers: {
            size: 0
        },
        labels: ['Jan', 'Feb', 'March', 'April', 'May', 'Jun']
    }

    var chart = new ApexCharts(
        document.querySelector("#apex-radar-multiple-series"),
        options
    );

    chart.render();
    function update() {

        function randomSeries() {
            var arr = []
            for(var i = 0; i < 6; i++) {
                arr.push(Math.floor(Math.random() * 100)) 
            }

            return arr
        }       

        chart.updateSeries([{
            name: 'Sales',
            data: randomSeries(),
        }, {
            name: 'Income',
            data: randomSeries(),
        }, {
            name: 'Expense',
            data: randomSeries(),
        }])
    }
});

// DEVICE USE BY STUDENT
var options = {
    chart: {
        height: 215,
        type: 'donut',
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        show: true,
    },
    colors: ['#45aaf2', '#6435c9', '#5a67d8'],
    series: [55, 35, 10]
}
var chart = new ApexCharts(document.querySelector("#apex-DeviceusebyStudent"), options);
chart.render();