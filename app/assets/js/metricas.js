let rec, showCharts, clone, idSelect = 0,
	showRegs = 5, year = parseInt(DATE.getFullYear()) - (showRegs-1),
	subSelected, compareAll = false

window.addEventListener('load', async(e) => {
	$a('.dep').forEach(node => node.classList.add('d-none')) // Hide department options
	$a('.department').forEach(node => node.disabled = true) // Disable dropdown for department
	$a('.car').forEach(node => node.classList.add('d-none')) // Hide department options
	$a('.career').forEach(node => node.disabled = true) // Disable dropdown for department
	
	$a('.canvas-container canvas').forEach(node => node.classList.add('d-none'))
	
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

	while(tgt.parentNode) {
        tgt = tgt.parentNode
        if(tgt.getAttribute('data-id') != undefined) {
            idConfig = parseInt(tgt.getAttribute('data-id'))
            break
        }
    }

	document.querySelector(`.panel[data-id="${idConfig}"] .config-menu`)
		.classList.toggle('d-none')
}

function emptySubordinate() {
	$e(`.panel[data-id="${idSelect}"] .sub-s`).selected = true
	subSelected = null
}

function areaSelect() {
	$e(`.panel[data-id="${idSelect}"] .department .dep-s`).classList.add('d-none') //Hide default option
	$e(`.panel[data-id="${idSelect}"] .department .dep`).classList.add('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	let areaIndex = $e(`.panel[data-id="${idSelect}"] .area`)
		[$e(`.panel[data-id="${idSelect}"] .area`).selectedIndex].getAttribute('value'),
		affected = $a(`.panel[data-id="${idSelect}"] .department .dep[data-area="${parseInt(areaIndex)}"]`)

	if(affected.length) { //If in the area exists departments
		$e(`.panel[data-id="${idSelect}"] .department .dep-s`).innerHTML = (lang == 0) 
																			? '-Selecciona departamento-'
																			: '-Select department-'
		$e(`.panel[data-id="${idSelect}"] .department .dep-s`).classList.remove('d-none')
		$e(`.panel[data-id="${idSelect}"] .department .dep-s`).selected = true
		$e(`.panel[data-id="${idSelect}"] .department`).disabled = false

		affected.forEach(node => {
			node.classList.remove('d-none')
		})
	} else {
		//Else 🟢
		$e(`.panel[data-id="${idSelect}"] .department .dep-s`).innerHTML = 'N/A'
		$e(`.panel[data-id="${idSelect}"] .department .dep-s`).classList.remove('d-none')
		$e(`.panel[data-id="${idSelect}"] .department .dep-s`).selected = true
		$e(`.panel[data-id="${idSelect}"] .department`).disabled = true
		$a(`.panel[data-id="${idSelect}"] .department .dep`).forEach(node => {
			node.classList.add('d-none')
		})
	}
	$e(`.panel[data-id="${idSelect}"] .career .car-s`).innerHTML = 'N/A'
	$e(`.panel[data-id="${idSelect}"] .career .car-s`).classList.remove('d-none')
	$e(`.panel[data-id="${idSelect}"] .career .car-s`).selected = true
	$e(`.panel[data-id="${idSelect}"] .career`).disabled = true
	$a(`.panel[data-id="${idSelect}"] .career .car`).forEach(node => {
		node.classList.add('d-none')
	})
}

function depaSelect() {
	$e(`.panel[data-id="${idSelect}"] .department .dep-s`).classList.add('d-none') //Hide default option
	$e(`.panel[data-id="${idSelect}"] .career .car-s`).classList.add('d-none') //Hide default option
	$e(`.panel[data-id="${idSelect}"] .career .car`).classList.add('d-none') ////Hide again all career options

	//And show all departments the ones that match with the area selected
	let depaIndex = $e(`.panel[data-id="${idSelect}"] .department`)
		[$e(`.panel[data-id="${idSelect}"] .department`).selectedIndex].getAttribute('value'),
		affected = $a(`.panel[data-id="${idSelect}"] .career .car[data-depa='${parseInt(depaIndex)}']`)

	if(affected.length) {
		//If in the area exists any departments
		$e(`.panel[data-id="${idSelect}"] .career .car-s`).innerHTML = (lang == 0) 
																		? '-Selecciona departamento-'
																		: '-Select department-'
		$e(`.panel[data-id="${idSelect}"] .career .car-s`).classList.remove('d-none')
		$e(`.panel[data-id="${idSelect}"] .career .car-s`).selected = true
		$e(`.panel[data-id="${idSelect}"] .career`).disabled = false
		affected.forEach(node => {
			node.classList.remove('d-none')
		})
	} else {
		//Else 🟢
		$e(`.panel[data-id="${idSelect}"] .career .car-s`).innerHTML = 'N/A'
		$e(`.panel[data-id="${idSelect}"] .career .car-s`).classList.remove('d-none')
		$e(`.panel[data-id="${idSelect}"] .career .car-s`).selected = true
		$e(`.panel[data-id="${idSelect}"] .career`).disabled = true
		$a(`.panel[data-id="${idSelect}"] .career .car`).forEach(node => {
			node.classList.add('d-none')
		})
	}
}

function careSelect() {
	$e(`.panel[data-id="${idSelect}"] .career .car-s`).classList.add('d-none') //Hide default option
}

const formSelect = (e) => {
	const target = e.target
	let tgt = e.target, canvasTitle

	while(tgt.parentNode) {
        tgt = tgt.parentNode
        if(tgt.getAttribute('data-id') != undefined) {
            idSelect = parseInt(tgt.getAttribute('data-id'))
            break
        }
    }

	canvasTitle = document.querySelector(`.panel[data-id="${idSelect}"] .canvasTitle`)

	if(target.classList.contains('subordinates')) {
		subSelected = target.options[target.selectedIndex]

		if(target.selectedIndex > 0) {
			let nameArray = ((subSelected.innerHTML).trim()).split(' ')
			nameArray.length = parseInt((nameArray.length / 2)+0.5)
			canvasTitle.innerHTML = nameArray.join(' ')
		} else
		canvasTitle.innerHTML = 'PERSONAL A CARGO'
	}
	else if(target.classList.contains('area')) {
		areaSelect()
		emptySubordinate()
		if(document.querySelector(`.panel[data-id="${idSelect}"] .department`).selectedIndex == 0 &&
			document.querySelector(`.panel[data-id="${idSelect}"] .career`).selectedIndex == 0)
			canvasTitle.innerHTML = target.options[target.selectedIndex].innerHTML
	}
	else if(target.classList.contains('department')) {
		depaSelect()
		emptySubordinate()
		if(document.querySelector(`.panel[data-id="${idSelect}"] .career`).selectedIndex == 0)
			canvasTitle.innerHTML = target.options[target.selectedIndex].innerHTML
	}
	else if(target.classList.contains('career')) {
		careSelect()
		emptySubordinate()
		canvasTitle.innerHTML = target.options[target.selectedIndex].innerHTML
	}
	else return false

	getData(false)
}

const addPanel = () => {
	idSelect = parseInt(document.querySelector('.panel:last-of-type').getAttribute('data-id'))+1
	let panelsDisplayed = parseInt(document.querySelectorAll('.panel').length)

	if(compareAll) {
		showSnack(
			(lang == 0) ? 'Comparar todas las areas' : 'Compare all areas',
			null, SNACK.info
		)
	} else {
		if(panelsDisplayed < 4 && !compareAll) {
			clone.setAttribute('data-id', String(idSelect))
			document.getElementById('panelContainer').appendChild(clone)
		
			displayCharts(false)
			mainToolTip()
			buttonListeners()
			clone = document.querySelector('.panel:last-of-type').cloneNode(true)
			idSelect = -1
		} else
			showSnack(
				(lang == 0) ? 'El limite son 4 paneles' : 'The limit is 4 panels',
				null, SNACK.warning
			)
	}
}

const deletePanel = (e) => {
	let tgt = e.target, idDeletable

	while(tgt.parentNode) {
        tgt = tgt.parentNode
        if(tgt.getAttribute('data-id') != undefined) {
            idDeletable = parseInt(tgt.getAttribute('data-id'))
            break
        }
    }

	if(idDeletable != 0) {
		document.querySelector(`.panel[data-id="${idDeletable}"]`).remove()
	}
	else showSnack(
		(lang == 0) ? 'No puedes eliminar el panel principal 😡'
					: 'You cannot delete the main panel 😡',
		null, SNACK.error
	)
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
	if(showCharts != show) showCharts = show
	else return

	if(showCharts && idSelect != -1) {
		Array.prototype.forEach.call(
			document.querySelectorAll(`.panel[data-id="${idSelect}"] .ghost-container`),
			(node) => {
				node.classList.toggle('d-block', false)
				node.classList.toggle('d-none', true)
		})
		Array.prototype.forEach.call(
			document.querySelectorAll(`.panel[data-id="${idSelect}"] canvas, .panel[data-id="${idSelect}"] span:not(.lang)`),
			(node) => {
				node.classList.toggle('d-none', false)
				node.classList.toggle('d-block', true)
		})

		log(`[Report] Shown Panel ${idSelect}`, STYLE.cian)
	} else {
		Array.prototype.forEach.call(
			document.querySelectorAll(`.panel[data-id="${idSelect}"] canvas, .panel[data-id="${idSelect}"] span:not(.lang)`),
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

		log(`[Report] Hidden Panel ${idSelect}`, STYLE.pink)
	}
}

async function getData(auto) {
    auto = (typeof auto == 'undefined') ? true : auto

	let packed = {
		auto: auto
	}
	if(auto === false) {
		if(subSelected != undefined)
			packed._id = (parseInt(subSelected.getAttribute('data-index')) > 0) ? subSelected.getAttribute('value') : null
		packed.area = parseInt($e(`.panel[data-id="${idSelect}"] .area`)[$e(`.panel[data-id="${idSelect}"] .area`).selectedIndex].getAttribute('value'))
		packed.department = (parseInt($e(`.panel[data-id="${idSelect}"] .department`)[$e(`.panel[data-id="${idSelect}"] .department`).selectedIndex].getAttribute('value')) > 0)
				? parseInt($e(`.panel[data-id="${idSelect}"] .department`)[$e(`.panel[data-id="${idSelect}"] .department`).selectedIndex].getAttribute('value'))
				: null
		packed.career = (parseInt($e(`.panel[data-id="${idSelect}"] .career`)[$e(`.panel[data-id="${idSelect}"] .career`).selectedIndex].getAttribute('value')) > 0)
				? parseInt($e(`.panel[data-id="${idSelect}"] .career`)[$e(`.panel[data-id="${idSelect}"] .career`).selectedIndex].getAttribute('value'))
				: null
	}

    await fetchTo(
		'http://localhost:999/metricas',
		'POST',
		packed,
		(result) => {
            if(result.console) log(result.console, STYLE.warning)

			if(result.noti) showSnack(
				result.msg, 
				null, SNACK.info
			)

			if(result.status === 200) {
				if (result.data.subordinates != null) {
					console.log(idSelect)
					$a(`.panel[data-id="${idSelect}"] .subordinates .sub`).forEach(node => {
						node.remove()
					})
					$e(`.panel[data-id="${idSelect}"] .subordinates .sub-s`).selected = true
					if(result.data.subordinates.length > 0) {
						$e(`.panel[data-id="${idSelect}"] .subordinates`).disabled = false
						$e(`.panel[data-id="${idSelect}"] .subordinates .sub-s`).innerHTML = (lang == 0)
																							  ? '-Selecciona personal-'
																							  : '-Select personnel-'
																							  
						for (let i in result.data.subordinates) {
							$e(`.panel[data-id="${idSelect}"] .subordinates`).insertAdjacentHTML(
								'beforeend', `<option class="sub" data-index="${parseInt(i)+1}"`+
								`value="${result.data.subordinates[i]['_id']}">`+
								`${result.data.subordinates[i]['first_name']} `+
								`${result.data.subordinates[i]['last_name']}`+
								`</option>`
							)
						}
					} else {
						$e(`.panel[data-id="${idSelect}"] .subordinates`).disabled = true
						$e(`.panel[data-id="${idSelect}"] .subordinates .sub-s`).innerHTML = 'Sin registros'
					}
				}

				if(result.data.total != 0 && result.data.log.records != 0) {
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
				if(result.log === true) return log('[Report] '+result.msg, STYLE.error)
			}
			canvasId = undefined
        },
		(error) => {
			showSnack('Error '+error, null, SNACK.error)
			console.error(error)
			canvasId = undefined
		} 
	)
}
