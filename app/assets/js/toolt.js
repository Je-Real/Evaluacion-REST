var still_hover, msg, x, y, w, h

$(document).ready(() => {
    $('.h-toolt').mousemove((e) => {
        x = e.pageX
		y = e.pageY
		w = $('#toolt').width()
		h = $('#toolt').height()

        $('#toolt').css('marginLeft', x - (w + 10) + 'px')
        $('#toolt').css('marginTop', y - (h + 5) + 'px')
    })

	$('.h-toolt').hover((e) => {
        msg = $('.h-toolt:hover .toolt-txt').attr('data-text')
        $('#toolt p').html(msg)

        if(still_hover != $('.h-toolt').hover()){
            still_hover = true
            
            setTimeout(() => {
                if(still_hover) {
                    $('#toolt').addClass('show')
                }
            }, 800)
        }

	}, () => {
        setTimeout(() => {
            $('#toolt').removeClass('show')
            still_hover = false
        }, 100)
        
	})
})
