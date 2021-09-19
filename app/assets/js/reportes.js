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

    if(affected.length == 0){ //If in the area does not exist any departments
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
    
    if(parseInt($('#area').val()) > 0){
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
            success: function(result){
                if(result.status === 200){
                    showSnack(result.msg, 'success')
                    console.log(result.data)
                } else {
                    showSnack(result.msg, 'danger')
                }
            },
            error: function (xhr, status, error) { 
                showSnack('Status: '+status+'. '+error, 'error')
            }
        })
    }
})