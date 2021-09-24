var still_hover, x, y, w, h

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
        if(still_hover != $('.h-toolt:hover').hover()){
            still_hover = true
        }

		setTimeout(() => {
            if(still_hover) {
                $('#toolt').addClass('show')
            }
        }, t = ($('.h-toolt:hover').hover()) ? 1000 : 0)
	}, () => {
        setTimeout(() => {
            still_hover = false
            $('#toolt').removeClass('show')
        }, 200)
	})
})
