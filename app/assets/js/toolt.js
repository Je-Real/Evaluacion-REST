var still_hover, msg,
    x, y,
    w, h
    
window.addEventListener('DOMContentLoaded', mainToolTip())

async function mainToolTip() {
    await $('.h-toolt').mousemove(async(e) => {
        x = e.pageX
		y = e.pageY
		w = $('#toolt').width()
		h = $('#toolt').height()

        await $('#toolt').css('marginLeft', x - (w + 10) + 'px')
        await $('#toolt').css('marginTop', y - (h + 5) + 'px')
    })

	await $('.h-toolt').hover(async(e) => {
        if (still_hover != $('.h-toolt').hover()) {
            msg = $('.h-toolt:hover .toolt-txt').attr('data-text')
            await $('#toolt p').html(msg)
            still_hover = true
            
            await setTimeout(() => {
                if (still_hover) {
                    $('#toolt').addClass('show')
                }
            }, 800)
        }

	}, async() => {
        //Possible bug cause
        $(`#toolt`).removeClass('show')
        still_hover = false
	})
}