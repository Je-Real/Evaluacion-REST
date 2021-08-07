// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'
Chart.defaults.global.defaultFontColor = '#292b2c'

var labels, info

$(document).ready(function () {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/reporte/get',
        contentType: 'application/json; charset=utf-8',
        data: { _id: 'R123456789' },
        dataType: 'json',
        async: true,
        success: function (result) {
            if (result.status === 200) {
                for (record in result.data[0].records) {
                    info.push(result.data[0].records[record])
                    labels.push(String(record))
                }

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
                console.log('No:' + result.msg)
            }
        },
        error: function (xhr, status, error) { console.log('Status:' + status + '. ' + error) }
    })
})

