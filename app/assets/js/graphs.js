// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'
Chart.defaults.global.defaultFontColor = '#292b2c'

var labels = []
var info = []

user = localStorage.getItem('user')

//Pie
$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/reporte/get',
        contentType: 'application/json; charset=utf-8',
        data: {_id: user},
        dataType: 'json',
        async: true,
        success: function(result) {
            if(result.status === 200){
                for(record in result.data[0].records){
                    info.push(result.data[0].records[record])
                    labels.push(String(record))
                }

                // Pie Chart
                var ctx = document.getElementById("myPieChart")
                var myPieChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: info,
                            backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#28a745'],
                        }],
                    },
                })

                // Area Chart Example
                var ctx = document.getElementById("myAreaChart");
                var myAreaChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Sessions",
                            lineTension: 0.3,
                            backgroundColor: "rgba(221, 117, 0, 0.4)",
                            borderColor: "rgba(221, 117, 0, 1)",
                            pointRadius: 5,
                            pointBackgroundColor: "rgba(191, 46, 0, 1)",
                            pointBorderColor: "rgba(255,255,255,0.8)",
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: "rgba(191, 46, 0, 1)",
                            pointHitRadius: 50,
                            pointBorderWidth: 2,
                            data: info,
                        }],
                    },
                    options: {
                        scales: {
                            xAxes: [{
                                time: {
                                    unit: 'date'
                                },
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    maxTicksLimit: 7
                                }
                            }],
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                    max: 100,
                                    maxTicksLimit: 5
                                },
                                gridLines: {
                                    color: "rgba(0, 0, 0, .125)",
                                }
                            }],
                        },
                        legend: {
                            display: false
                        }
                    }
                })

                // Bar Chart
                var ctx = document.getElementById("myBarChart")
                var myLineChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: "Revenue",
                            backgroundColor: "rgba(40, 167, 69, 1)",
                            borderColor: "rgba(40, 167, 69, 1)",
                            data: info,
                        }],
                    },
                    options: {
                        scales: {
                            xAxes: [{
                                time: {
                                    unit: 'month'
                                },
                                gridLines: {
                                    display: false
                                },
                                ticks: {
                                    maxTicksLimit: 6
                                }
                            }],
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                    max: 100,
                                    maxTicksLimit: 5
                                },
                                gridLines: {
                                    display: true
                                }
                            }],
                        },
                        legend: {
                            display: false
                        }
                    }
                })
            }
            else {
                console.log('No:'+result.msg)
            }
        },
        error: function (xhr, status, error) { console.log('Status:' + status + '. ' + error) }
    })
})
