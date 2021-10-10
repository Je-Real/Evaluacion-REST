var still_hover, msg, t_id,
    x, y,
    w, h

$(document).ready(async() => {
    var tooltList = document.getElementsByClassName('h-toolt')
    if($('.h-toolt').html() != undefined) {
        for(let i=0; i<tooltList.length; i++){
            tooltList[i].id = Math.random().toString(16).substring(2, 10)
        }
    } else {
        return
    }

    await $('.h-toolt').mousemove(async(e) => {
        x = e.pageX
		y = e.pageY
		w = $('#toolt').width()
		h = $('#toolt').height()

        await $('#toolt').css('marginLeft', x - (w + 10) + 'px')
        await $('#toolt').css('marginTop', y - (h + 5) + 'px')
    })

	await $('.h-toolt').hover(async(e) => {
        if(still_hover != $('.h-toolt').hover()){
            msg = $('.h-toolt:hover .toolt-txt').attr('data-text')
            await $('#toolt p').html(msg)
            still_hover = true
            
            await setTimeout(() => {
                if(still_hover) {
                    $('#toolt').addClass('show')
                }
            }, 800)
        }

	}, async() => {
        //Possible bug cause
        $(`#toolt`).removeClass('show')
        still_hover = false
	})
})
