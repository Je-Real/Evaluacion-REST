// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'
Chart.defaults.global.defaultFontColor = '#292b2c'

$(document).ready(function () {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/sesion/login',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ _id: i, pass: p }),
        dataType: 'json',
        async: true,
        success: function (result) {
            
        },
        error: function (xhr, status, error) { console.log('Status:' + status + '. ' + error) }
    })
})

// Pie Chart Example
var ctx = document.getElementById("myPieChart");
var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ["Blue", "Red", "Yellow", "Green"],
        datasets: [{
            data: [12.21, 15.58, 11.25, 8.32],
            backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#28a745'],
        }],
    },
});
