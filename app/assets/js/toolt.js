let still_over = false,
	msg, t_id, toolt,
	x, y, w, h

const mainToolTip = (e) => {
	toolt = $e('#toolt')

	eventAssigner('.h-toolt', 'mousemove', mouseIn)
	eventAssigner('.h-toolt', 'mouseover', mouseOver)
	eventAssigner('.h-toolt', 'mouseout', mouseOut)
}

const mouseIn = async (e) => {
	test = e.target
	x = e.pageX
	y = e.pageY
	w = toolt.scrollWidth
	h = toolt.scrollHeight

	toolt.style.left = x - (w + 5) + 'px'
	toolt.style.top = y - (h + 10) + 'px'
}

const mouseOver = async (e) => {
	msg = String(e.target.getAttribute('toolt-txt')).trim()
	$e('#toolt p').innerHTML = msg
	still_over = true

	await setTimeout(() => {
		if (still_over) toolt.classList.add('show')
	}, 800)
}

const mouseOut = async (e) => {
	toolt.classList.remove('show')
	still_over = false
}

window.addEventListener('DOMContentLoaded', mainToolTip)