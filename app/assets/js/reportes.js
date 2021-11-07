var lvl, rec, showCharts, showRegs = 5

var year = parseInt(d.getFullYear()) - (showRegs-1)

$(document).ready(() => {
	$('.dep').addClass('d-none') //Hide department options
	$('#department').prop('disabled', true) //Disable dropdown for department
	lvl = parseInt($('#lvl').val())

	
	Array.prototype.forEach.call(document.querySelectorAll('.canvas-container canvas'), (node) => {
		node.classList.add('d-none')
	})
	document.querySelector('.canvas-container.semiDoughnutChart').innerHTML += `<div class="text-center d-block ghost-container">
		<i class="fas fa-ghost icon-ghost f-vScreen-15 my-3 text-black-15"></i>
		<p class="my-2 text-ghost">No hay datos para mostrar</p>
	</div>`
	displayCharts(false)

	setTimeout(() => {
		dataGetter(true)
    }, 150)
})

$('#area').change(() => {
	$('#dep-s').addClass('d-none') //Hide default option
	$('.dep').addClass('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	var affected = $(`.dep[data-area='${parseInt($('#area').val())}']`).removeClass('d-none')

	if (affected.length == 0) {
		//If in the area does not exist any departments
		$('#dep-s').text('N/A').removeClass('d-none').prop('selected', true)
		$('#department').prop('disabled', true)
		$('#car-s').text('N/A').removeClass('d-none').prop('selected', true)
		$('#career').prop('disabled', true)
	} else {
		//Else 🟢
		$('#dep-s').text('-Selecciona departamento-').removeClass('d-none').prop('selected', true)
		$('#department').prop('disabled', false)
	}
})

$('#department').change(() => {
	$('#dep-s').addClass('d-none') //Hide default option
	$('#car-s').addClass('d-none') //Hide default option
	$('.car').addClass('d-none') ////Hide again all career options

	//And show all departments the ones that match with the area selected
	var affected = $(`.car[data-depa='${parseInt($('#department').val())}']`).removeClass('d-none')

	if (affected.length == 0) {
		//If in the area does not exist any departments
		$('#car-s').text('N/A').removeClass('d-none').prop('selected', true)
		$('#career').prop('disabled', true)
	} else {
		//Else 🟢
		$('#car-s').text('-Selecciona departamento-').removeClass('d-none').prop('selected', true)
		$('#career').prop('disabled', false)
	}
})

$('#career').change(() => {
	$('#car-s').addClass('d-none') //Hide default option
})

$('.form-select').change(() => {
	dataGetter(false)
})

function displayCharts(bool) {
	if (showCharts != bool) showCharts = bool
	else return

	if (showCharts) {
		Array.prototype.forEach.call(document.querySelectorAll('.ghost-container'), (node) => {
			if(node.classList.contains('d-block'))
				node.classList.remove('d-block')
			if(!node.classList.contains('d-none'))
				node.classList.add('d-none')
		})
		Array.prototype.forEach.call(document.querySelectorAll('.canvas-container canvas, .canvas-container span'), (node) => {
			if(node.classList.contains('d-none'))
				node.classList.remove('d-none')
			if(!node.classList.contains('d-block'))
				node.classList.add('d-block')
		})
		/*$('.canvas-container.line').html(`
			<canvas id="lineChart" width="100%" height="75%"></canvas>
		`)*/
	} else {
		Array.prototype.forEach.call(document.querySelectorAll('.canvas-container canvas, .canvas-container span'), (node) => {
			if(node.classList.contains('d-block'))
				node.classList.remove('d-block')
			if(!node.classList.contains('d-none'))
				node.classList.add('d-none')
		})
		Array.prototype.forEach.call(document.querySelectorAll('.ghost-container'), (node) => {
			if(node.classList.contains('d-none'))
				node.classList.remove('d-none')
			if(!node.classList.contains('d-block'))
				node.classList.add('d-block')
		})
	}
}

function dataGetter(auto) {
	auto = (auto == undefined) ? true : auto

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