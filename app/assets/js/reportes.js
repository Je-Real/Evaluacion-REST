$(document).ready(() => {
    $('.dep').addClass('d-none') //Hide department options
    $('#department').prop('disabled', true) //Disable dropdown for department
})

$('#area').change(() => {
    $('#dep-s').addClass('d-none') //Hide default option
    $('.dep').addClass('d-none') ////Hide again all department options

    var affected = $(`.dep[data-area="${parseInt($('#area').val())}"]`) //And show all departments
        .removeClass('d-none')                                          //the ones that match
        .addClass('d-block')                                            //with the area selected

    if(affected.length == 0){ //If in the area does not exist any departments
        $('#dep-s').text('N/A')
            .removeClass('d-none')
            .addClass('d-block')
            .prop('selected', true)
        $('#department').prop('disabled', true)
    } else { //Else 🟢
        $('#dep-s').text('-Selecciona departamento-')
            .removeClass('d-none')
            .addClass('d-block')
            .prop('selected', true)
        $('#department').prop('disabled', false)
    }
})

$('#department').change(() => {
    $('#dep-s').addClass('d-none') //Hide default option
})

function login() {
    var a = document.getElementById('area').value
    var d = document.getElementById('department').value

    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/reportes/get',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ area: a, department: d }),
        dataType: 'json',
        async: true,
        success: function(result){
            if(result.noti){
                showSnack(result.msg, 'success')
            } else {
                $('#loginMsg').addClass('text-danger')
                $('#loginMsg').html(result.msg)
            }

            if(result.status === 200){
                toggleFloating(0)
                setTimeout(() => {
                    window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
                }, 100) /* Change */
            }
        },
        error: function (xhr, status, error) { 
            showSnack('Status:'+status+'. '+error, 'error')
        }
    })
}