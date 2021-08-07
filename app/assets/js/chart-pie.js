// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'
Chart.defaults.global.defaultFontColor = '#292b2c'

var labels = []
var info = []

$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/reporte/get',
        contentType: 'application/json; charset=utf-8',
        data: {_id: 'R123456789'},
        dataType: 'json',
        async: true,
        success: function(result) {
            if(result.status === 200){
                for(record in result.data[0].records){
                    info.push(result.data[0].records[record])
                    labels.push(String(record))
                }

                console.log('L:',labels)
                console.log('D:',info)

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
            }
            else {
                console.log('No:'+result.msg)
            }
        },
        error: function (xhr, status, error) { console.log('Status:' + status + '. ' + error) }
    })
})