/*let still_hover, msg,
    x, y,
    w, h
    
window.addEventListener('load', mainToolTip())

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
        if(still_hover != $('.h-toolt').hover()) {
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
}*/

let still_over = false,
	msg, t_id,
	x, y, w, h

window.addEventListener("load", (e) => {
	document.querySelector("body").classList.add("loaded")
})

window.addEventListener("DOMContentLoaded", (e) => {
	let tooltList = document.querySelectorAll(".h-toolt")
	    toolt = document.getElementById("toolt")

	Array.prototype.forEach.call(tooltList, (node) => {
		node.addEventListener("mousemove", mouseIn, false)
		node.addEventListener("mouseover", mouseOver, false)
		node.addEventListener("mouseout", mouseOut, false)
	})
})

const mouseIn = async (e) => {
	test = e.target
	x = e.pageX
	y = e.pageY
	w = toolt.scrollWidth
	h = toolt.scrollHeight

	toolt.style.left = x - (w + 5) + "px"
	toolt.style.top = y - (h + 10) + "px"
}

const mouseOver = async (e) => {
	msg = e.target.getAttribute("toolt-txt").trim()
	document.querySelector("#toolt p").innerHTML = msg
	still_over = true

	await setTimeout(() => {
		if (still_over) toolt.classList.add("show")
	}, 800)
}

const mouseOut = async (e) => {
	toolt.classList.remove("show")
	still_over = false
}
