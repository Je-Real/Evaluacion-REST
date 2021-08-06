// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'
Chart.defaults.global.defaultFontColor = '#292b2c'

var labels, data

$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/reporte/get',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: true,
        success: function(result) {
            if(result.status === 200){
                for(record in result.data[0].records){
                    labels = labels.push(record)
                    data = data.push(result.data[0].records[record])
                }
                console.log('Done')
            }
            else {
                console.log('No',result)
            }
        },
        error: function (xhr, status, error) { console.log('Status:' + status + '. ' + error) }
    })
})

// Pie Chart Example
var ctx = document.getElementById("myPieChart");
var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#28a745'],
        }],
    },
    //CAMBIAR LOS DATOS DE LA TABLA
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
});
