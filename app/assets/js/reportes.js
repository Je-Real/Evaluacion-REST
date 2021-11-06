var lvl, rec, showCharts, showRegs = 5
const date = new Date()
const year = parseInt(date.getFullYear()) - (showRegs-1)

$(document).ready(() => {
	$('.dep').addClass('d-none') //Hide department options
	$('#department').prop('disabled', true) //Disable dropdown for department
	lvl = parseInt($('#lvl').val())

	displayCharts(false)

	if (lvl > 0) {
		setTimeout(() => {
			dataGetter(true)
        }, 800)
	}
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
		if (lvl <= 0) {
			$('.chart-display.doughnut').html(`
				<canvas id="doughnutChart" width="100%" height="40"></canvas>
			`)
		}
		$('.chart-display.bar').html(`
			<canvas id="barChart" width="100%" height="75%"></canvas>
		`)
		$('.chart-display.line').html(`
			<canvas id="lineChart" width="100%" height="75%"></canvas>
		`)
	} else {
		$('.chart-display').html(`
			<div class="text-center">
				<i class="fas fa-ghost icon-ghost f-vScreen-15 my-3 text-black-15"></i>
				<p class="my-2 text-ghost">No hay datos para mostrar</p>
			</div>
		`)
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
				if (result.status === 200) {
					try {
						var years = [], records = []
	
						for(let i = 0; i <= 4; i++) {
							years.push(String(year+i))
							rec = (result.data[0].records[year+i] > 0) ? result.data[0].records[year+i] : 0
							records.push(rec)
						}

						displayCharts(true)
						doughnutChart(years, records)
						barChart(years, records)
						lineChart(years, records)
					}
					catch { displayCharts(false) }
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