const config = (e) => {
	e.target.classList.toggle('move')
	document.querySelector(`.config-menu[data-id="${e.target.getAttribute('data-id')}"]`).classList.toggle('d-none')
}

let lvl, rec, showCharts, toCopy,
	showRegs = 5, year = parseInt(d.getFullYear()) - (showRegs-1)

window.addEventListener('DOMContentLoaded', async(event) => {
	$('.dep').addClass('d-none') //Hide department options
	$('#department').prop('disabled', true) //Disable dropdown for department
	lvl = parseInt($('#lvl').val())
	
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

function buttonListeners() {
	Array.prototype.forEach.call(
		document.querySelectorAll('.canvas-config'),
		(node) => {
			node.addEventListener('click', config)
	})

	document.getElementById('addPanel').addEventListener('click', () => {
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

		console.log(copy);

		copy.querySelector('.semiDoughnutChart canvas')
			.setAttribute('id', 'semiDoughnutChart-'+canvasId)
		copy.querySelector('.barsChart canvas')
			.setAttribute('id', 'barsChart-'+canvasId)
	
		document.getElementById('panelContainer').appendChild(copy)
	
		buttonListeners()
		mainToolTip()
		displayCharts(false, canvasId)
	})
	
	document.querySelector('.area').addEventListener('change', (e) => {
		let id = e.target.getAttribute('data-id')

		$(`.department[data-id="${id}"] .dep-s`).addClass('d-none') //Hide default option
		$(`.department[data-id="${id}"] .dep`).addClass('d-none') ////Hide again all department options
	
		//And show all departments the ones that match with the area selected
		let affected = $(`.department[data-id="${id}"] .dep[data-area='${parseInt($('.area[data-id="'+id+'"]').val())}']`).removeClass('d-none')
	
		if (affected.length == 0) {
			//If in the area does not exist any departments
			$(`.department[data-id="${id}"] .dep-s`).text('N/A').removeClass('d-none').prop('selected', true)
			$(`.department[data-id="${id}"]`).prop('disabled', true)
			$(`.career[data-id="${id}"] .car-s`).text('N/A').removeClass('d-none').prop('selected', true)
			$(`.career[data-id="${id}"]`).prop('disabled', true)
		} else {
			//Else 🟢
			$(`.department[data-id="${id}"] .dep-s`).text('-Selecciona departamento-').removeClass('d-none').prop('selected', true)
			$(`.department[data-id="${id}"]`).prop('disabled', false)
		}
	})
	
	$('.department').change((e) => {
		let id = e.target.getAttribute('data-id')

		$(`.department[data-id="${id}"] .dep-s`).addClass('d-none') //Hide default option
		$(`.career[data-id="${id}"] .car-s`).addClass('d-none') //Hide default option
		$(`.career[data-id="${id}"] .car`).addClass('d-none') ////Hide again all career options
	
		//And show all departments the ones that match with the area selected
		let affected = $(`.career[data-id="${id}"] .car[data-depa='${parseInt($('.department[data-id="'+id+'"]').val())}']`).removeClass('d-none')
	
		if (affected.length == 0) {
			//If in the area does not exist any departments
			$(`.career[data-id="${id}"] .car-s`).text('N/A').removeClass('d-none').prop('selected', true)
			$(`.career[data-id="${id}"]`).prop('disabled', true)
		} else {
			//Else 🟢
			$(`.career[data-id="${id}"] .car-s`).text('-Selecciona departamento-').removeClass('d-none').prop('selected', true)
			$(`.career[data-id="${id}"]`).prop('disabled', false)
		}
	})
	
	$('.career').change((e) => {
		let id = e.target.getAttribute('data-id')

		$(`.career[data-id="${id}"] .car-s`).addClass('d-none') //Hide default option
	})
	
	$('.form-select').change(() => {
		dataGetter(false)
	})
}

function displayCharts(bool, id) {
	id = (id != undefined) ? `.canvas-container[data-id="${id}"]` : '.canvas-container'
	
	if (showCharts != bool) showCharts = bool
	else return

	if (showCharts) {
		Array.prototype.forEach.call(
			document.querySelectorAll(`${id} .ghost-container`),
			(node) => {
				if(node.classList.contains('d-block'))
					node.classList.remove('d-block')
				if(!node.classList.contains('d-none'))
					node.classList.add('d-none')
		})
		Array.prototype.forEach.call(
			document.querySelectorAll(`${id} canvas, ${id} span`),
			(node) => {
				if(node.classList.contains('d-none'))
					node.classList.remove('d-none')
				if(!node.classList.contains('d-block'))
					node.classList.add('d-block')
		})
	} else {
		Array.prototype.forEach.call(
			document.querySelectorAll(`${id} canvas, ${id} span`),
			(node) => {
				if(node.classList.contains('d-block'))
					node.classList.remove('d-block')
				if(!node.classList.contains('d-none'))
					node.classList.add('d-none')
		})
		Array.prototype.forEach.call(
			document.querySelectorAll(`${id} .ghost-container`),
			(node) => {
				if(node.classList.contains('d-none'))
					node.classList.remove('d-none')
				if(!node.classList.contains('d-block'))
					node.classList.add('d-block')
		})
	}
}

function dataGetter(auto) {
	auto = (auto == undefined) ? true : auto

	//                                                           ------------  MODIFY  --------------
	//Get reports
	var area = 0,
	depart = null,
	career = null,
	packed,
	user = $('#user').val()
	
	if (!auto) {
		area = parseInt($('#area').val())
		depart = (parseInt($('#department').val()) > 0) ? parseInt($('#department').val()) : null
		career = (parseInt($('#career').val()) > 0) ? parseInt($('#career').val()) : null
	}
	//                                                           ------------  MODIFY  --------------
	
	if (area > 0 || auto) {
		$.ajax({
			type: 'POST',
			url: 'http://localhost:3000/reportes/get',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify({
				area: area,
				department: depart,
				career: career,
				_id: user,
			}),
			dataType: 'json',
			async: true,
			success: (result) => {
				if (result.console) console.log(result.console)

				if (result.status === 200) {
					try {
						semiDoughnutChart(result.data.total)
						barChart(result.data.log.years, result.data.log.records)
						//lineChart(years, records)
						displayCharts(true)
					}
					catch (error) {
						displayCharts(false)
						console.error(error)
					}
				}
				else {
					if (result.log === true) return console.log(result.msg)
					showSnack(result.msg, 'danger')
				}
			},
			error: (xhr, status, error) => {
				showSnack('Status: ' + status + '. ' + error, 'error')
			},
		})
	}
}