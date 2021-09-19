$(document).ready(() => {
    $('.tooltip-tb svg').hover(() => {
        setTimeout(() => {
            $('.tooltip-tb:hover').addClass('hover')
        }, 400)
    }, () => {
        setTimeout(() => {
            $('.tooltip-tb.hover').removeClass('hover')
        }, 100)
    })

    $('.tooltip-tb.radio').append(`
        <span class="tooltiptext one-line">
            You cannot read this🥶😂😂😂
        </span>
    `)
    
    $('.fa-sad-tear+.tooltiptext').html('<p class="m-0">Deficiente</p>')
    $('.fa-meh+.tooltiptext').html('<p class="m-0">Regular</p>')
    $('.fa-smile+.tooltiptext').html('<p class="m-0">Bueno</p>')
    $('.fa-laugh-beam+.tooltiptext').html('<p class="m-0">Muy bueno</p>')

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

