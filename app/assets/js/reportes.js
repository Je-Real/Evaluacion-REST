$(document).ready(() => {
    $('.dep').addClass('d-none') //Hide department options
    $('#department').prop('disabled', true) //Disable dropdown for department
})

$('#area').change(() => {
    $('#dep-s').addClass('d-none') //Hide default option
    $('.dep').addClass('d-none') ////Hide again all department options

    //And show all departments the ones that match with the area selected
    var affected = $(`.dep[data-area="${parseInt($('#area').val())}"]`)
        .removeClass('d-none')

    if (affected.length == 0) { //If in the area does not exist any departments
        $('#dep-s').text('N/A')
            .removeClass('d-none')
            .prop('selected', true)
        $('#department').prop('disabled', true)
    } else { //Else 🟢
        $('#dep-s').text('-Selecciona departamento-')
            .removeClass('d-none')
            .prop('selected', true)
        $('#department').prop('disabled', false)
    }
})

$('#department').change(() => {
    $('#dep-s').addClass('d-none') //Hide default option
})

$('.form-select').change(() => { //Get reports
    area = parseInt($('#area').val())
    depart = (parseInt($('#department').val()) > 0) ? parseInt($('#department').val()) : null

    if (parseInt($('#area').val()) > 0) {
        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/reportes/get',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                area: area,
                department: depart,
                _id: user
            }),
            dataType: 'json',
            async: true,
            success: function (result) {
                if (result.status === 200) {
                    showSnack(result.msg, 'success')
                    var years = [], records = []
                    for(var r in result.data[0].records) {
                        years.push(String(r))
                        records.push(result.data[0].records[r])
                    }

                    var ctx = document.getElementById('pieChart').getContext('2d')
                    var pieChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: years, //Modify
                            datasets: [{
                                label: '# of Votes',
                                data: records, //Modify
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)',
                                    'rgba(255, 159, 64, 0.2)'
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    'rgba(255, 159, 64, 1)'
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    })
                } else {
                    showSnack(result.msg, 'danger')
                }
            },
            error: function (xhr, status, error) {
                showSnack('Status: ' + status + '. ' + error, 'error')
            }
        })
    }
})

