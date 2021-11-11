let rec, showCharts, toCopy, idSelect,
	showRegs = 5, year = parseInt(d.getFullYear()) - (showRegs-1)

window.addEventListener('DOMContentLoaded', async(e) => {
	$('.dep').addClass('d-none') //Hide department options
	$('.department').prop('disabled', true) //Disable dropdown for department
	$('.car').addClass('d-none') //Hide department options
	$('.career').prop('disabled', true) //Disable dropdown for department
	
	Array.prototype.forEach.call(
		document.querySelectorAll('.canvas-container canvas'),
		(node) => {
			node.classList.add('d-none')
	})
	document.querySelector('.canvas-container.semiDoughnutChart').innerHTML += `<div class="text-center d-block ghost-container">
		<i class="fas fa-ghost icon-ghost f-vScreen-15 my-3 text-black-15"></i>
		<p class="my-2 text-ghost">No hay datos para mostrar</p>
	</div>`
	toCopy = document.querySelector('.panel:last-of-type')
	
	displayCharts(false)
	buttonListeners()
	
	setTimeout(() => {
		dataGetter(true)
    }, 150)
})

const config = (e) => {
	e.target.classList.toggle('move')
	document.querySelector(`.config-menu[data-id="${e.target.getAttribute('data-id')}"]`).classList.toggle('d-none')
}

const areaSelect = (e) => {
	idSelect = parseInt(e.target.getAttribute('data-id'))

	$(`.department[data-id="${idSelect}"] .dep-s`).addClass('d-none') //Hide default option
	$(`.department[data-id="${idSelect}"] .dep`).addClass('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	let affected = $(`.department[data-id="${idSelect}"] .dep[data-area='${parseInt($('.area[data-id="'+idSelect+'"]').val())}']`).removeClass('d-none')

	if (affected.length == 0) {
		//If in the area does not exist any departments
		$(`.department[data-id="${idSelect}"] .dep-s`).text('N/A').removeClass('d-none').prop('selected', true)
		$(`.department[data-id="${idSelect}"]`).prop('disabled', true)
		$(`.career[data-id="${idSelect}"] .car-s`).text('N/A').removeClass('d-none').prop('selected', true)
		$(`.career[data-id="${idSelect}"]`).prop('disabled', true)
	} else {
		//Else 🟢
		$(`.department[data-id="${idSelect}"] .dep-s`).text('-Selecciona departamento-').removeClass('d-none').prop('selected', true)
		$(`.department[data-id="${idSelect}"]`).prop('disabled', false)
	}
}

const depaSelect = (e) => {
	idSelect = parseInt(e.target.getAttribute('data-id'))

	$(`.department[data-id="${idSelect}"] .dep-s`).addClass('d-none') //Hide default option
	$(`.career[data-id="${idSelect}"] .car-s`).addClass('d-none') //Hide default option
	$(`.career[data-id="${idSelect}"] .car`).addClass('d-none') ////Hide again all career options

	//And show all departments the ones that match with the area selected
	let affected = $(`.career[data-id="${idSelect}"] .car[data-depa='${parseInt($('.department[data-id="'+idSelect+'"]').val())}']`).removeClass('d-none')

	if (affected.length == 0) {
		//If in the area does not exist any departments
		$(`.career[data-id="${idSelect}"] .car-s`).text('N/A').removeClass('d-none').prop('selected', true)
		$(`.career[data-id="${idSelect}"]`).prop('disabled', true)
	} else {
		//Else 🟢
		$(`.career[data-id="${idSelect}"] .car-s`).text('-Selecciona departamento-').removeClass('d-none').prop('selected', true)
		$(`.career[data-id="${idSelect}"]`).prop('disabled', false)
	}
}

const careSelect = (e) => {
	idSelect = parseInt(e.target.getAttribute('data-id'))
	$(`.career[data-id="${idSelect}"] .car-s`).addClass('d-none') //Hide default option
}

const addPanel = () => {
	let canvasId = parseInt(document.querySelector('.panel:last-of-type').getAttribute('data-id'))+1,
		copy = toCopy.cloneNode(true)
	
	Array.prototype.forEach.call(
		copy.querySelectorAll('.canvas-container'),
		(node) => {
			node.setAttribute('data-id', canvasId)
	})
	Array.prototype.forEach.call(
		copy.querySelectorAll('*[data-id="0"]'),
		(node) => {
			node.setAttribute('data-id', String(canvasId))
	})

	copy.querySelector('.semiDoughnutChart canvas')
		.setAttribute('id', 'semiDoughnutChart-'+canvasId)
	copy.querySelector('.barsChart canvas')
		.setAttribute('id', 'barsChart-'+canvasId)

	document.getElementById('panelContainer').appendChild(copy)

	displayCharts(false, canvasId)
	mainToolTip()
	return buttonListeners()
}

const formSelect = () => {
	dataGetter(false, idSelect)
	console.log('Canvas '+idSelect)
}

async function eventAssigner(element, event, funcEvent) {
	try {
		Array.prototype.forEach.call(
			document.querySelectorAll(element),
			(node) => {
				node.addEventListener(event, funcEvent)
		})
		return true
	} catch (error) {
		console.error(error)
		throw false
	}
}

async function eventUnassigner(element, event, funcEvent) {
	try {
		Array.prototype.forEach.call(
			document.querySelectorAll(element),
			(node) => {
				node.removeEventListener(event, funcEvent)
		})
		return true
	} catch (error) {
		console.error(error)
		throw false
	}
}

function buttonListeners() {
	eventUnassigner('.canvas-config', 'click', config).catch((error) => {return console.error(error)})
	eventUnassigner('#addPanel', 'click', addPanel).catch((error) => {return console.error(error)})
	eventUnassigner('.area', 'change', areaSelect).catch((error) => {return console.error(error)})
	eventUnassigner('.department', 'change', depaSelect).catch((error) => {return console.error(error)})
	eventUnassigner('.career', 'change', careSelect).catch((error) => {return console.error(error)})
	eventUnassigner('.form-select', 'change', formSelect).catch((error) => {return console.error(error)})

	eventAssigner('.canvas-config', 'click', config).catch((error) => {return console.error(error)})
	eventAssigner('#addPanel', 'click', addPanel).catch((error) => {return console.error(error)})
	eventAssigner('.area', 'change', areaSelect).catch((error) => {return console.error(error)})
	eventAssigner('.department', 'change', depaSelect).catch((error) => {return console.error(error)})
	eventAssigner('.career', 'change', careSelect).catch((error) => {return console.error(error)})
	eventAssigner('.form-select', 'change', formSelect).catch((error) => {return console.error(error)})
}

function displayCharts(bool, id) {
	id = (id != undefined) ? `.canvas-container[data-id="${id}"]` : '.canvas-container'
	
	if (showCharts != bool) showCharts = bool
	else return

	if (showCharts) {
		Array.prototype.forEach.call(
			document.querySelectorAll(`${id} .ghost-container`),
			(node) => {
				node.classList.toggle('d-block', false)
				node.classList.toggle('d-none', true)
		})
		Array.prototype.forEach.call(
			document.querySelectorAll(`${id} canvas, ${id} span`),
			(node) => {
				node.classList.toggle('d-none', false)
				node.classList.toggle('d-block', true)
		})

		console.log('Shown');
	} else {
		Array.prototype.forEach.call(
			document.querySelectorAll(`${id} canvas, ${id} span`),
			(node) => {
				node.classList.toggle('d-block', false)
				node.classList.toggle('d-none', true)
		})
		Array.prototype.forEach.call(
			document.querySelectorAll(`${id} .ghost-container`),
			(node) => {
				node.classList.toggle('d-none', false)
				node.classList.toggle('d-block', true)
		})

		console.log('Hidden');
	}
}

function dataGetter(auto, canvasId) {
	auto = (auto == undefined) ? true : auto
	canvasId = (typeof canvasId == 'number') ? canvasId : 0

	let area = 0,
		depart = null,
		career = null
		//user = $('.user').val()
	
	if (!auto) {
		area = parseInt($(`.area[data-id="${canvasId}"]`).val())
		depart = (parseInt($(`.department[data-id="${canvasId}"]`).val()) > 0) ? parseInt($(`.department[data-id="${canvasId}"]`).val()) : null
		career = (parseInt($(`.career[data-id="${canvasId}"]`).val()) > 0) ? parseInt($(`.career[data-id="${canvasId}"]`).val()) : null
	}
	
	if (area > 0 || auto) {
		$.ajax({
			type: 'POST',
			url: 'http://localhost:3000/reportes/get',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify({
				area: area,
				department: depart,
				career: career,
			}),
			dataType: 'json',
			async: true,
			success: (result) => {
				if (result.console) console.log(result.console)

				if (result.status === 200) {
					try {						
						semiDoughnutChart(canvasId, result.data.total)
						barChart(canvasId, result.data.log.years, result.data.log.records)
						//lineChart(years, records)
						displayCharts(true, canvasId)
					}
					catch (error) {
						displayCharts(false, canvasId)
						console.error(error)
					}
				}
				else {
					if (result.log === true) return console.log(result.msg)
					showSnack(result.msg, 'danger')
				}

				canvasId = undefined
			},
			error: (xhr, status, error) => {
				showSnack('Status: ' + status + '. ' + error, 'error')
			},
		})
	}
}