let rec, showCharts, clone, idSelect = 0,
	showRegs = 5, year = parseInt(DATE.getFullYear()) - (showRegs-1),
	subSelected, compareAll = false

const barChartSearch = () => {
	let toSearch = $e('#sel-bar-chart')[$e('#sel-bar-chart').selectedIndex].value

	fetchTo(
		'http://localhost:999/metrics/all',
		'POST',
		{ search: toSearch },
		(result) => {
			if(result.noti === true) {
				showSnack(result.msg, null, SNACK[result.notiType])
			}

			if(result.status === 200) {
				if(result.data.length) {
					let barLabels = [],
						barData = []

					for(let i in result.data) {
						barLabels.push(result.data[i].desc)
						barData.push(
							(
								typeof result.data[i].total === 'number' 
								&& (result.data[i].total != 0
								&& result.data[i].length != 0)
							)
							? (result.data[i].total / result.data[i].length).toFixed(2)
							: 0
						)
					}

					try {
						barChart('#bars canvas', barLabels, barData)
						displayCharts(true, '#bars canvas')
					}
					catch (error) {
						console.error(error)
					}
				}
			}
		},
		(error) => {
			showSnack('Error '+error, null, SNACK.error)
			console.error(error)
		}
	)
}

window.addEventListener('load', async(e) => {
	$a('.dep').forEach(node => node.classList.add('d-none')) // Hide department options
	$a('.department').forEach(node => node.disabled = true) // Disable dropdown for department
	$a('.car').forEach(node => node.classList.add('d-none')) // Hide department options
	$a('.career').forEach(node => node.disabled = true) // Disable dropdown for department
	
	$a('.canvas-container canvas').forEach(node => node.classList.add('d-none'))
	
	document.querySelector('.canvas-container.semiDoughnutChart').innerHTML += `<div class="text-center d-block ghost-container">
		<i class="fa-solid fa-ghost icon-ghost f-vScreen-15 my-3 text-black-15"></i>
		<p class="my-2 text-ghost">No hay datos para mostrar</p>
	</div>`
	clone = document.querySelector('.panel:last-of-type').cloneNode(true)
	document.querySelector('.panel[data-id="0"] .canvas-remove').remove()
	
	displayCharts(false, idSelect)
	barChartSearch()
	
	eventAssigner('#addPanel', 'click', addPanel).catch((error) => {return console.error(error)})
	eventAssigner('#sel-bar-chart', 'change', barChartSearch).catch((error) => {return console.error(error)})
	buttonListeners()
	
	setTimeout(() => {
		getData(true)
    }, 150)
})

function displayCharts(show, idElement) {
	if(typeof idElement === 'number') {
		if(showCharts != show) showCharts = show
		else return

		if(showCharts && idElement != -1) {
			$a(`.panel[data-id="${idElement}"] .ghost-container`).forEach(
				(node) => {
					node.classList.toggle('d-block', false)
					node.classList.toggle('d-none', true)
			})
			$a(`.panel[data-id="${idElement}"] canvas, .panel[data-id="${idElement}"] span:not(.lang)`).forEach(
				(node) => {
					node.classList.toggle('d-none', false)
					node.classList.toggle('d-block', true)
			})
	
			log(`[Metrics] Shown Panel ${idElement}`, STYLE.cian)
		} else {
			$a(`.panel[data-id="${idElement}"] canvas, .panel[data-id="${idElement}"] span:not(.lang)`).forEach(
				(node) => {
					node.classList.toggle('d-block', false)
					node.classList.toggle('d-none', true)
			})
			$a(`.panel[data-id="${idElement}"] .ghost-container`).forEach(
				(node) => {
					node.classList.toggle('d-none', false)
					node.classList.toggle('d-block', true)
			})
	
			log(`[Metrics] Hidden Panel ${idElement}`, STYLE.pink)
		}
	} else {
		if(show)
			$e(idElement).classList.replace('d-none', 'd-block')
		else
			$e(idElement).classList.replace('d-block', 'd-none')
	}
}

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
		
			displayCharts(false, idSelect)
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
	eventUnassigner('.form-select:not(#sel-bar-chart)', 'change', formSelect).catch((error) => {return console.error(error)})
	
	eventAssigner('.canvas-config', 'click', config).catch((error) => {return console.error(error)})
	eventAssigner('.canvas-remove', 'click', deletePanel).catch((error) => {return console.error(error)})
	eventAssigner('.form-select:not(#sel-bar-chart)', 'change', formSelect).catch((error) => {return console.error(error)})
}

async function getData(auto) {
    auto = (typeof auto == 'undefined') ? true : auto

	let package = {
		auto: auto
	}
	if(auto === false) {
		if(subSelected != undefined)
			package._id = (parseInt(subSelected.getAttribute('data-index')) > 0) ? subSelected.getAttribute('value') : null
		package.area = parseInt($e(`.panel[data-id="${idSelect}"] .area`)[$e(`.panel[data-id="${idSelect}"] .area`).selectedIndex].getAttribute('value'))
		package.department = (parseInt($e(`.panel[data-id="${idSelect}"] .department`)[$e(`.panel[data-id="${idSelect}"] .department`).selectedIndex].getAttribute('value')) > 0)
				? parseInt($e(`.panel[data-id="${idSelect}"] .department`)[$e(`.panel[data-id="${idSelect}"] .department`).selectedIndex].getAttribute('value'))
				: null
		package.career = (parseInt($e(`.panel[data-id="${idSelect}"] .career`)[$e(`.panel[data-id="${idSelect}"] .career`).selectedIndex].getAttribute('value')) > 0)
				? parseInt($e(`.panel[data-id="${idSelect}"] .career`)[$e(`.panel[data-id="${idSelect}"] .career`).selectedIndex].getAttribute('value'))
				: null
	}

    await fetchTo(
		'http://localhost:999/metrics',
		'POST',
		package,
		(result) => {
            if(result.console) log(result.console, STYLE.warning)

			if(result.noti) showSnack(
				result.msg, 
				null, SNACK.info
			)

			if(result.status === 200) {
				if (result.data.subordinates != null) {
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
						let lineLabels = []
						for(let i in result.data.log.years) {
							lineLabels.push([
									result.data.log.years[i],
									(result.data.log.records[i] > 0 || result.data.log.records[i] != false)
									? '[ ' + result.data.log.records[i] + '% ]'
									: '[ N/A ]'
							])
						}

						semiDoughnutChart(idSelect, result.data.total)
						lineChart(idSelect, lineLabels, result.data.log.records)
						displayCharts(true, idSelect)
						
						idSelect = -1
					}
					catch (error) {
						displayCharts(false, idSelect)
						console.error(error)
					}
				} else displayCharts(false, idSelect)
			}
			else {
				if(result.log === true) return log('[Metrics] '+result.msg, STYLE.error)
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
