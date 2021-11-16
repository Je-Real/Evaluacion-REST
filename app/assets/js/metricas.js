let rec, showCharts, clone, idSelect = 0,
	showRegs = 5, year = parseInt(d.getFullYear()) - (showRegs-1)

window.addEventListener('load', async(e) => {
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
	clone = document.querySelector('.panel:last-of-type').cloneNode(true)
	document.querySelector('.panel[data-id="0"] .canvas-remove').remove()
	
	displayCharts(false)
	
	eventAssigner('#addPanel', 'click', addPanel).catch((error) => {return console.error(error)})
	buttonListeners()
	
	setTimeout(() => {
		getData(true)
    }, 150)
})

const config = (e) => {
	let tgt = e.target, idConfig
	tgt.classList.toggle('move')

	while (tgt.parentNode) {
        tgt = tgt.parentNode
        if (tgt.getAttribute('data-id') != undefined) {
            idConfig = parseInt(tgt.getAttribute('data-id'))
            break
        }
    }

	document.querySelector(`.panel[data-id="${idConfig}"] .config-menu`)
		.classList.toggle('d-none')
}

function areaSelect() {
	$(`.panel[data-id="${idSelect}"] .department .dep-s`).addClass('d-none') //Hide default option
	$(`.panel[data-id="${idSelect}"] .department .dep`).addClass('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	let affected = $(`.panel[data-id="${idSelect}"] .department .dep[data-area='${parseInt($(`.panel[data-id="${idSelect}"] .area`).val())}']`)
		.removeClass('d-none')

	if (affected.length) {
		//If in the area exists departments
		$(`.panel[data-id="${idSelect}"] .department .dep-s`).text('-Selecciona departamento-').removeClass('d-none')
		.prop('selected', true)
		$(`.panel[data-id="${idSelect}"] .department`).prop('disabled', false)
	} else {
		//Else 🟢
		$(`.panel[data-id="${idSelect}"] .department .dep-s`).text('N/A').removeClass('d-none').prop('selected', true)
		$(`.panel[data-id="${idSelect}"] .department`).prop('disabled', true)
		$(`.panel[data-id="${idSelect}"] .career .car-s`).text('N/A').removeClass('d-none').prop('selected', true)
		$(`.panel[data-id="${idSelect}"] .career`).prop('disabled', true)
	}
}

function depaSelect() {
	$(`.panel[data-id="${idSelect}"] .department .dep-s`).addClass('d-none') //Hide default option
	$(`.panel[data-id="${idSelect}"] .career .car-s`).addClass('d-none') //Hide default option
	$(`.panel[data-id="${idSelect}"] .career .car`).addClass('d-none') ////Hide again all career options

	//And show all departments the ones that match with the area selected
	let affected = $(`.panel[data-id="${idSelect}"] .career .car[data-depa='${parseInt($(`.panel[data-id="${idSelect}"] .department`).val())}']`)
		.removeClass('d-none')

	if (affected.length) {
		//If in the area exists any departments
		$(`.panel[data-id="${idSelect}"] .career .car-s`).text('-Selecciona departamento-').removeClass('d-none')
		.prop('selected', true)
		$(`.panel[data-id="${idSelect}"] .career`).prop('disabled', false)
	} else {
		//Else 🟢
		$(`.panel[data-id="${idSelect}"] .career .car-s`).text('N/A').removeClass('d-none').prop('selected', true)
		$(`.panel[data-id="${idSelect}"] .career`).prop('disabled', true)
	}
}

function careSelect() {
	$(`.panel[data-id="${idSelect}"] .career .car-s`).addClass('d-none') //Hide default option
}

const formSelect = (e) => {
	let tgt = e.target, canvasTitle

	while (tgt.parentNode) {
        tgt = tgt.parentNode
        if (tgt.getAttribute('data-id') != undefined) {
            idSelect = parseInt(tgt.getAttribute('data-id'))
            break
        }
    }

	canvasTitle = document.querySelector(`.panel[data-id="${idSelect}"] .canvasTitle`)

	if (e.target.classList.contains('area')) {
		areaSelect()
		if (document.querySelector(`.panel[data-id="${idSelect}"] .department`).selectedIndex == 0 &&
			document.querySelector(`.panel[data-id="${idSelect}"] .career`).selectedIndex == 0)
			canvasTitle.innerHTML = e.target.options[e.target.selectedIndex].innerHTML
	}
	else if (e.target.classList.contains('department')) {
		depaSelect()
		if (document.querySelector(`.panel[data-id="${idSelect}"] .career`).selectedIndex == 0)
			canvasTitle.innerHTML = e.target.options[e.target.selectedIndex].innerHTML
	}
	else if (e.target.classList.contains('career')) {
		careSelect()
		canvasTitle.innerHTML = e.target.options[e.target.selectedIndex].innerHTML
	}
	else return false


	getData(false)
}

const addPanel = () => {
	idSelect = parseInt(document.querySelector('.panel:last-of-type').getAttribute('data-id'))+1
	let panelsDisplayed = parseInt(document.querySelectorAll('.panel').length)

	if (panelsDisplayed <= 4) {
		clone.setAttribute('data-id', String(idSelect))
		document.getElementById('panelContainer').appendChild(clone)
	
		displayCharts(false)
		mainToolTip()
		buttonListeners()
		clone = document.querySelector('.panel:last-of-type').cloneNode(true)
		idSelect = -1
	} else {
		showSnack('El limite son 4 paneles', 'warning')
	}
}

const deletePanel = (e) => {
	let tgt = e.target, idDeletable

	while (tgt.parentNode) {
        tgt = tgt.parentNode
        if (tgt.getAttribute('data-id') != undefined) {
            idDeletable = parseInt(tgt.getAttribute('data-id'))
            break
        }
    }

	if (idDeletable != 0) {
		document.querySelector(`.panel[data-id="${idDeletable}"]`).remove()
	}
	else showSnack('No puedes eliminar el panel principal 😡', 'error')
}

function buttonListeners() {
	eventUnassigner('.canvas-config', 'click', config).catch((error) => {return console.error(error)})
	eventUnassigner('.canvas-remove', 'click', deletePanel).catch((error) => {return console.error(error)})
	eventUnassigner('.form-select', 'change', formSelect).catch((error) => {return console.error(error)})
	
	eventAssigner('.canvas-config', 'click', config).catch((error) => {return console.error(error)})
	eventAssigner('.canvas-remove', 'click', deletePanel).catch((error) => {return console.error(error)})
	eventAssigner('.form-select', 'change', formSelect).catch((error) => {return console.error(error)})
}

function displayCharts(show) {
	if (showCharts != show) showCharts = show
	else return

	if (showCharts && idSelect != -1) {
		Array.prototype.forEach.call(
			document.querySelectorAll(`.panel[data-id="${idSelect}"] .ghost-container`),
			(node) => {
				node.classList.toggle('d-block', false)
				node.classList.toggle('d-none', true)
		})
		Array.prototype.forEach.call(
			document.querySelectorAll(`.panel[data-id="${idSelect}"] canvas, .panel[data-id="${idSelect}"] span`),
			(node) => {
				node.classList.toggle('d-none', false)
				node.classList.toggle('d-block', true)
		})

		log(`[Report] Shown Panel ${idSelect}`, style.cian)
	} else {
		Array.prototype.forEach.call(
			document.querySelectorAll(`.panel[data-id="${idSelect}"] canvas, .panel[data-id="${idSelect}"] span`),
			(node) => {
				node.classList.toggle('d-block', false)
				node.classList.toggle('d-none', true)
		})
		Array.prototype.forEach.call(
			document.querySelectorAll(`.panel[data-id="${idSelect}"] .ghost-container`),
			(node) => {
				node.classList.toggle('d-none', false)
				node.classList.toggle('d-block', true)
		})

		log(`[Report] Hidden Panel ${idSelect}`, style.pink)
	}
}

async function getData(auto) {
    auto = (typeof auto == 'undefined') ? true : auto

	let packed = {}
		//user = $('.user').val()
	
	if (auto === false) {
		packed.area = parseInt($(`.panel[data-id="${idSelect}"] .area`).val())
		packed.depart = (parseInt($(`.panel[data-id="${idSelect}"] .department`).val()) > 0) ? parseInt($(`.panel[data-id="${idSelect}"] .department`).val()) : null
		packed.career = (parseInt($(`.panel[data-id="${idSelect}"] .career`).val()) > 0) ? parseInt($(`.panel[data-id="${idSelect}"] .career`).val()) : null
	}

    await $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/metricas',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(packed),
        dataType: 'json',
        async: true,
        success: (result) => {
            if (result.console) log(result.console, style.warning)

			if (result.noti) showSnack(result.msg, result.notiType)

			if (result.status === 200) {
				if (result.data.total != 0 && result.data.log.records != 0) {
					try {						
						semiDoughnutChart(idSelect, result.data.total)
						barChart(idSelect, result.data.log.years, result.data.log.records)
						//lineChart(years, records)
						displayCharts(true)
						idSelect = -1
					}
					catch (error) {
						displayCharts(false)
						console.error(error)
					}
				} else displayCharts(false)
			}
			else {
				if (result.log === true) return log('[Report] '+result.msg, style.error)
			}
			canvasId = undefined
        },
        error: (xhr, status, error) => {
            showSnack('Status: '+status+'. '+error, 'error')
			canvasId = undefined
        }
    })
}
