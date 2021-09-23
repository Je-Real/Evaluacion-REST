var _id, lvl

$(document).ready(() => {
    _id = $('#user').val()
    lvl = $('#lvl').val()

    $('#user').remove()
    $('#lvl').remove()

    $('.tooltip-tb svg').hover(() => {
        setTimeout(() => {
            $('.tooltip-tb:hover').addClass('hover')
        }, 400)
    }, () => {
        setTimeout(() => {
            $('.tooltip-tb.hover').removeClass('hover')
        }, 100)
    })

    $('input[type="radio"]').click(function(){
        var active_V = 0
        var active_VI = 0

        if($('input[name="P-I"]:checked').val()) {
            $('#P-I').removeClass('table-header-deactivated-light')
            $('#P-I').addClass('table-header-activated-light')
        } else {
            $('#P-I').removeClass('table-header-activated-light')
            $('#P-I').addClass('table-header-deactivated-light')
        }

        if($('input[name="P-II"]:checked').val()) {
            $('#P-II').removeClass('table-header-deactivated-light')
            $('#P-II').addClass('table-header-activated-light')
        } else {
            $('#P-II').removeClass('table-header-activated-light')
            $('#P-II').addClass('table-header-deactivated-light')
        }
        
        if($('input[name="P-III"]:checked').val()) {
            $('#P-III').removeClass('table-header-deactivated-light')
            $('#P-III').addClass('table-header-activated-light')
        } else {
            $('#P-III').removeClass('table-header-activated-light')
            $('#P-III').addClass('table-header-deactivated-light')
        }
        
        if($('input[name="P-IV"]:checked').val()) {
            $('#P-IV').removeClass('table-header-deactivated-light')
            $('#P-IV').addClass('table-header-activated-light')
        } else {
            $('#P-IV').removeClass('table-header-activated-light')
            $('#P-IV').addClass('table-header-deactivated-light')
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
            $('#P-V').removeClass('table-header-deactivated-light')
            $('#P-V').addClass('table-header-activated-light')
        } else {
            $('#P-V').removeClass('table-header-activated-light')
            $('#P-V').addClass('table-header-deactivated-light')
        }
        
        if($('input[name="P-IX"]:checked').val()) { active_VI++ } 
        else { active_VI+-1 }
        if($('input[name="P-X"]:checked').val()) { active_VI++ } 
        else { active_VI+-1 }

        if(active_VI == 2) {
            $('#P-VI').removeClass('table-header-deactivated-light')
            $('#P-VI').addClass('table-header-activated-light')
        } else {
            $('#P-VI').removeClass('table-header-activated-light')
            $('#P-VI').addClass('table-header-deactivated-light')
        }
    })
})

function postSurvey() {
    var temp, grades = {
        p_1: $('input[name="P-I"]:checked'),
        p_2: $('input[name="P-II"]:checked'),
        p_3: $('input[name="P-III"]:checked'),
        p_4: $('input[name="P-IV"]:checked'),
        p_5: $('input[name="P-V"]:checked'),
        p_6: $('input[name="P-VI"]:checked'),
        p_7: $('input[name="P-VII"]:checked'),
        p_8: $('input[name="P-VIII"]:checked'),
        p_9: $('input[name="P-IX"]:checked'),
        p_10: $('input[name="P-X"]:checked')
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
            _id: _id,
            lvl: lvl,
            grades : grades
        }),
        dataType: 'json',
        async: true,
        success: function(result){
            if(result.status === 200){
                showSnack(result.msg, result.resType)
                setTimeout(() => {
                    window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
                }, 100)
            }
        },
        error: function (xhr, status, error) { 
            showSnack('Status:'+status+'. '+error, 'error')
        }
    })
}