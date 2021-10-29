function listView() {
    $('.card.card-option').removeClass('w-md-25 mb-4').addClass('w-100 w-lg-75 mb-2')
    $('.mode').removeClass('card-mode').addClass('list-mode')
    $('.card-body').addClass('pt-1 pb-2')
    $('.card-body>.row').removeClass('text-center')
    $('.columns.row div').removeClass('col-12').addClass('col-lg-3 col-6')

    $('#card').addClass('btn-secondary').removeClass('btn-on')
    $('#list').removeClass('btn-secondary').addClass('btn-on')
}

function cardView() {
    $('.card.card-option').removeClass('w-100 w-lg-75 mb-2').addClass('w-md-25 mb-4')
    $('.mode').removeClass('list-mode').addClass('card-mode')
    $('.card-body').removeClass('pt-1 pb-2')
    $('.card-body>.row').addClass('text-center')
    $('.columns.row div').removeClass('col-lg-3 col-6').addClass('col-12')

    $('#list').addClass('btn-secondary').removeClass('btn-on')
    $('#card').removeClass('btn-secondary').addClass('btn-on')
}

$(document).ready(async() => {
    await getCookie('USelected')
    .then((data) => {
        selectObjective(data)
        setCookie('USelected', '')
    })
    .catch((error) => {
        console.error('Error (No selected!):', error)
    })

    $('input[type="radio"]').click(() => {
        var active_V = 0
        var active_VI = 0

        if($('input[name="P-I"]:checked').val()) {
            $('#P-I').removeClass('deactivated')
            $('#P-I').addClass('activated')
        } else {
            $('#P-I').removeClass('activated')
            $('#P-I').addClass('deactivated')
        }

        if($('input[name="P-II"]:checked').val()) {
            $('#P-II').removeClass('deactivated')
            $('#P-II').addClass('activated')
        } else {
            $('#P-II').removeClass('activated')
            $('#P-II').addClass('deactivated')
        }
        
        if($('input[name="P-III"]:checked').val()) {
            $('#P-III').removeClass('deactivated')
            $('#P-III').addClass('activated')
        } else {
            $('#P-III').removeClass('activated')
            $('#P-III').addClass('deactivated')
        }
        
        if($('input[name="P-IV"]:checked').val()) {
            $('#P-IV').removeClass('deactivated')
            $('#P-IV').addClass('activated')
        } else {
            $('#P-IV').removeClass('activated')
            $('#P-IV').addClass('deactivated')
        }

        if($('input[name="P-V"]:checked').val()) { active_V++ } 
        else { active_V+-1 }
        if($('input[name="P-VI"]:checked').val()) { active_V++ } 
        else { active_V+-1 }
        if($('input[name="P-VII"]:checked').val()) { active_V++ } 
        else { active_V+-1 }
        if($('input[name="P-VIII"]:checked').val()) { active_V++ } 
        else { active_V+-1 }

        if(active_V == 4) {
            $('#P-V').removeClass('deactivated')
            $('#P-V').addClass('activated')
        } else {
            $('#P-V').removeClass('activated')
            $('#P-V').addClass('deactivated')
        }

        if($('input[name="P-IX"]:checked').val()) { active_VI++ } 
        else { active_VI+-1 }
        if($('input[name="P-X"]:checked').val()) { active_VI++ } 
        else { active_VI+-1 }

        if(active_VI == 2) {
            $('#P-VI').removeClass('deactivated')
            $('#P-VI').addClass('activated')
        } else {
            $('#P-VI').removeClass('activated')
            $('#P-VI').addClass('deactivated')
        }

        if($('input[name="P-XI"]:checked').val()) {
            $('#P-VII').removeClass('deactivated')
            $('#P-VII').addClass('activated')
        } else {
            $('#P-VII').removeClass('activated')
            $('#P-VII').addClass('deactivated')
        }
    })
})

$('.card.card-option').click(() => {selectObjective(true)})

function selectObjective(hover) {
    if(hover.length==0) return

    $('#f_survey')[0].reset()
    if($('.table-header').hasClass('activated')) {
        $('.table-header').removeClass('activated').addClass('deactivated')
    }

    $('.card.card-option').removeClass('selected')
    if(hover === true) {
        $('.card.card-option:hover').addClass('selected')
    } else {
            $(`div#${hover}`).addClass('selected')
    }

    var s = $('.card.card-option.selected').attr('data-id')

    $('#userObj').val(s)
    $('#areaObj').val($(`#${s}-area`).attr('data-info'))
    $('#depaObj').val($(`#${s}-depa`).attr('data-info'))
    $('#careObj').val($(`#${s}-care`).attr('data-info'))
}

function postSurvey() {
    var grades = {
        p_1: $('input[name="P-I"]:checked'),
        p_2: $('input[name="P-II"]:checked'),
        p_3: $('input[name="P-III"]:checked'),
        p_4: $('input[name="P-IV"]:checked'),
        p_5: $('input[name="P-V"]:checked'),
        p_6: $('input[name="P-VI"]:checked'),
        p_7: $('input[name="P-VII"]:checked'),
        p_8: $('input[name="P-VIII"]:checked'),
        p_9: $('input[name="P-IX"]:checked'),
        p_10: $('input[name="P-X"]:checked'),
        p_11: $('input[name="P-XI"]:checked')
    }

    for (var grade in grades){
        //console.log(`${grade} = ${grades[grade].val()}`)
        if(grades[grade].val() == undefined){
            return showSnack('¡Aun no se puede enviar!<br/>Debes completar la encuesta', 'warning')
        }
        grades[grade] = parseInt(grades[grade].val())
    }

    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/encuesta',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
            _id: $('#userObj').val(),
            records: grades
        }),
        dataType: 'json',
        async: true,
        success:(result) => {
            if(result.noti) showSnack(result.msg, result.resType)

            if(result.status === 200){
                setTimeout(() => {
                    window.location.href = String(location.href).slice(0, 21+1)+"control/"
                }, 1500)
            }
        },
        error: function (xhr, status, error) { 
            showSnack('Status:'+status+'. '+error, 'error')
        }
    })
}