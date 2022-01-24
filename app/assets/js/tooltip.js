let still_over = false,
	msg, t_id, tooltip,
	x, y, w, h, tgt

const mainToolTip = (e) => {
	tooltip = $e('#tooltip')

	eventAssigner('.tooltip-text', 'mousemove', mouseIn)
	eventAssigner('.tooltip-text', 'mouseover', mouseOver)
	eventAssigner('.tooltip-text', 'mouseout', mouseOut)
}

const mouseIn = async (e) => {
	test = e.target
	x = e.pageX
	y = e.pageY
	w = tooltip.scrollWidth
	h = tooltip.scrollHeight

	tooltip.style.left = x - (w + 5) + 'px'
	tooltip.style.top = y - (h + 10) + 'px'
}

const mouseOver = async (e) => {
	tgt = e.target
	if(String(tgt.getAttribute('data-tooltip-es')).length > 0)
		msg = String(tgt.getAttribute('data-tooltip-es')).trim()
	else
		while(tgt.parentNode) {
			tgt = tgt.parentNode
			if(String(tgt.getAttribute('data-tooltip-es')).length > 0) {
				msg = String(tgt.getAttribute('data-tooltip-es')).trim()
				break
			}
		}

	$e('#tooltip p').innerHTML = msg
	still_over = true

	await setTimeout(() => {
		if (still_over) tooltip.classList.add('show')
	}, 800)
}

const mouseOut = async (e) => {
	tooltip.classList.remove('show')
	still_over = false
}

window.addEventListener('DOMContentLoaded', mainToolTip)