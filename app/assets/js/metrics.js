let rec, showCharts, clone, idSelect = 0,
	showRegs = 5, year = parseInt(DATE.getFullYear()) - (showRegs-1),
	subSelected, compareAll = false,
	barSearch, lastConfigPanel = -1

const barChartSearch = () => {
	barSearch = $e('#sel-bar-chart')[$e('#sel-bar-chart').selectedIndex].value

	if(barSearch === 'department') $e('#bars').classList.add('ext')
	else $e('#bars').classList.remove('ext')

	fetchTo(
		'http://localhost:999/metrics/all',
		'POST',
		{ search: barSearch },
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

const monoMetrics = async() => { // Get all the individual graphs
	let metrics = {}, length = 0

	$a('.lienzos').forEach((node, i) => {
		let semi = node.querySelector('.semiDoughnutChart canvas'),
			line = node.querySelector('.lineChart canvas'),
			divisible = i % 2

		if(!(`${length}` in metrics)) metrics[`${length}`] = {}

		metrics[`${length}`][`${divisible}`] = {
			title: node.querySelector('.canvasTitle').innerHTML.trim(),
			semi: semi.toDataURL().split(',')[1],
			score: node.querySelector('.semiDoughnutChart span').innerHTML.trim(),
			line: line.toDataURL().split(',')[1]
		}

		if(divisible) length++
	})

	return metrics
}

const polyMetrics = async() => { // Get the bar graph  
	let canvasGetter = $e('#bars canvas')
	return canvasGetter.toDataURL().split(',')[1]
}

const generatePDF = async(mode = '') => {
	let REQ_PARAMS, pkg
	$e('#layoutSidenav_content').classList.add('fixed-size')

	setTimeout(async() => {
		switch (mode) {
			case 'all':
				pkg = {
					barSearch: barSearch,
					poly: await polyMetrics(),
					mono: await monoMetrics(),
				}
				break
			
			case 'poly':
				pkg = {
					barSearch: barSearch,
					poly: await polyMetrics(),
				}
				break
			
			case 'mono':
				pkg = {
					mono: await monoMetrics(),
				}
				break
		
			default:
				return showSnack(
					(lang == 0) 
						? 'No se recibieron parámetros en la solicitud de descarga'
						: 'No parameters has been received in download request',
						null, SNACK.error
				)
		}

		REQ_PARAMS = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(pkg)
		}
		
		await fetch('http://localhost:999/metrics/print', REQ_PARAMS)
			.then(async res => await res.arrayBuffer()) // response data to array buffer
			.then(async data => {
				if(data == null || data == undefined || String(data) == '')
					return showSnack('Server error', null, SNACK.error)
				const blob = new Blob([data]) // Create a Blob object
				const url = URL.createObjectURL(blob) // Create an object URL
				download(url, (lang == 0) ? `formato-evaluacion---.pdf` : `evaluation-format---.pdf`) // Download file
				URL.revokeObjectURL(url) // Release the object URL

				$e('#layoutSidenav_content').classList.remove('fixed-size')
			})
			.catch(err => {
				showSnack(
					(lang == 0) ? 'Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte'
								: 'Please open the browser console, copy the error and contact a support specialist.',
					null,
					SNACK.error
				)
				console.error(err)
			})
	}, 150)
}

window.addEventListener('load', async(e) => {
	$a('.dep').forEach(node => node.classList.add('d-none')) // Hide department options
	$a('.direction').forEach(node => node.disabled = true) // Disable dropdown for department
	$a('.car').forEach(node => node.classList.add('d-none')) // Hide department options
	$a('.position').forEach(node => node.disabled = true) // Disable dropdown for department
	
	$a('.canvas-container canvas').forEach(node => node.classList.add('d-none'))
	
	$e('.canvas-container.semiDoughnutChart').innerHTML += `<div class="text-center d-block ghost-container">
		<i class="fa-solid fa-ghost icon-ghost f-vScreen-15 my-3 text-black-15"></i>
		<p class="my-2 text-ghost">No hay datos para mostrar</p>
	</div>`
	clone = $e('.panel:last-of-type').cloneNode(true)
	$e('.panel[data-id="0"] .canvas-remove').remove()
	
	displayCharts(false, idSelect)
	barChartSearch()
	
	eventAssigner('#addPanel', 'click', addPanel).catch((error) => {return console.error(error)})
	eventAssigner('#sel-bar-chart', 'change', barChartSearch).catch((error) => {return console.error(error)})
	eventAssigner('#btn-download-pdf', 'click', () => generatePDF('all'))
	buttonListeners()
	
	setTimeout(() => {
		getData(true)
    }, 150)

	eventAssigner('html', 'click', configClose)
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
	let tgt = e.target
	tgt.classList.toggle('animate')

	upperAttrIterator(tgt, 'data-id')
	.then(id => {
		if(lastConfigPanel != id) {
			$a(`.panel:not([data-id="${id}"]) .config-menu.d-block`).forEach(node => {
				node.classList.replace('d-block', 'd-none')
			})
			$a(`.panel:not([data-id="${id}"]) .canvas-config.animate`).forEach(node => {
				node.classList.remove('animate')
			})
			
			lastConfigPanel = id
		}
		
		let config = $e(`.panel[data-id="${id}"] .config-menu`)
		if(config.classList.contains('d-none'))
			config.classList.replace('d-none', 'd-block')
		else
			config.classList.replace('d-block', 'd-none')
	})
	.catch(error => console.error(error))
}

const configClose = (e) => {
	if(!e.target.matches('.canvas-config.animate') && !e.target.closest(`.panel[data-id="${lastConfigPanel}"] .config-menu`)) {
		$a('.config-menu.d-block').forEach(node => {
			node.classList.replace('d-block', 'd-none')
		})
		$a('.canvas-config.animate').forEach(node => {
			node.classList.remove('animate')
		})
	}
}

function emptySubordinate() {
	$e(`.panel[data-id="${idSelect}"] .sub-s`).selected = true
	subSelected = null
}

function areaSelect() {
	$e(`.panel[data-id="${idSelect}"] .direction .dep-s`).classList.add('d-none') //Hide default option
	$e(`.panel[data-id="${idSelect}"] .direction .dep`).classList.add('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	let areaIndex = $e(`.panel[data-id="${idSelect}"] .area`)
		[$e(`.panel[data-id="${idSelect}"] .area`).selectedIndex].getAttribute('value'),
		affected = $a(`.panel[data-id="${idSelect}"] .direction .dep[data-area="${parseInt(areaIndex)}"]`)

	if(affected.length) { //If in the area exists departments
		$e(`.panel[data-id="${idSelect}"] .direction .dep-s`).innerHTML = (lang == 0) 
																			? '-Selecciona departamento-'
																			: '-Select department-'
		$e(`.panel[data-id="${idSelect}"] .direction .dep-s`).classList.remove('d-none')
		$e(`.panel[data-id="${idSelect}"] .direction .dep-s`).selected = true
		$e(`.panel[data-id="${idSelect}"] .direction`).disabled = false

		affected.forEach(node => {
			node.classList.remove('d-none')
		})
	} else {
		//Else 🟢
		$e(`.panel[data-id="${idSelect}"] .direction .dep-s`).innerHTML = 'N/A'
		$e(`.panel[data-id="${idSelect}"] .direction .dep-s`).classList.remove('d-none')
		$e(`.panel[data-id="${idSelect}"] .direction .dep-s`).selected = true
		$e(`.panel[data-id="${idSelect}"] .direction`).disabled = true
		$a(`.panel[data-id="${idSelect}"] .direction .dep`).forEach(node => {
			node.classList.add('d-none')
		})
	}
	$e(`.panel[data-id="${idSelect}"] .position .car-s`).innerHTML = 'N/A'
	$e(`.panel[data-id="${idSelect}"] .position .car-s`).classList.remove('d-none')
	$e(`.panel[data-id="${idSelect}"] .position .car-s`).selected = true
	$e(`.panel[data-id="${idSelect}"] .position`).disabled = true
	$a(`.panel[data-id="${idSelect}"] .position .car`).forEach(node => {
		node.classList.add('d-none')
	})
}

function depaSelect() {
	$e(`.panel[data-id="${idSelect}"] .direction .dep-s`).classList.add('d-none') //Hide default option
	$e(`.panel[data-id="${idSelect}"] .position .car-s`).classList.add('d-none') //Hide default option
	$e(`.panel[data-id="${idSelect}"] .position .car`).classList.add('d-none') ////Hide again all career options

	//And show all departments the ones that match with the area selected
	let depaIndex = $e(`.panel[data-id="${idSelect}"] .direction`)
		[$e(`.panel[data-id="${idSelect}"] .direction`).selectedIndex].getAttribute('value'),
		affected = $a(`.panel[data-id="${idSelect}"] .position .car[data-depa='${parseInt(depaIndex)}']`)

	if(affected.length) {
		//If in the area exists any departments
		$e(`.panel[data-id="${idSelect}"] .position .car-s`).innerHTML = (lang == 0) 
																		? '-Selecciona departamento-'
																		: '-Select department-'
		$e(`.panel[data-id="${idSelect}"] .position .car-s`).classList.remove('d-none')
		$e(`.panel[data-id="${idSelect}"] .position .car-s`).selected = true
		$e(`.panel[data-id="${idSelect}"] .position`).disabled = false
		affected.forEach(node => {
			node.classList.remove('d-none')
		})
	} else {
		//Else 🟢
		$e(`.panel[data-id="${idSelect}"] .position .car-s`).innerHTML = 'N/A'
		$e(`.panel[data-id="${idSelect}"] .position .car-s`).classList.remove('d-none')
		$e(`.panel[data-id="${idSelect}"] .position .car-s`).selected = true
		$e(`.panel[data-id="${idSelect}"] .position`).disabled = true
		$a(`.panel[data-id="${idSelect}"] .position .car`).forEach(node => {
			node.classList.add('d-none')
		})
	}
}

function careSelect() {
	$e(`.panel[data-id="${idSelect}"] .position .car-s`).classList.add('d-none') //Hide default option
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

	canvasTitle = $e(`.panel[data-id="${idSelect}"] .canvasTitle`)

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
		if($e(`.panel[data-id="${idSelect}"] .direction`).selectedIndex == 0 &&
			$e(`.panel[data-id="${idSelect}"] .position`).selectedIndex == 0)
			canvasTitle.innerHTML = target.options[target.selectedIndex].innerHTML
	}
	else if(target.classList.contains('department')) {
		depaSelect()
		emptySubordinate()
		if($e(`.panel[data-id="${idSelect}"] .position`).selectedIndex == 0)
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
	idSelect = parseInt($e('.panel:last-of-type').getAttribute('data-id'))+1
	let panelsDisplayed = parseInt($a('.panel').length)

	if(compareAll) {
		showSnack(
			(lang == 0) ? 'Comparar todas las areas' : 'Compare all areas',
			null, SNACK.info
		)
	} else {
		if(panelsDisplayed < 4 && !compareAll) {
			clone.setAttribute('data-id', String(idSelect))
			$e('#panelContainer').appendChild(clone)
		
			displayCharts(false, idSelect)
			mainToolTip()
			buttonListeners()
			clone = $e('.panel:last-of-type').cloneNode(true)
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
		$e(`.panel[data-id="${idDeletable}"]`).remove()
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
	eventUnassigner('html', 'click', configClose).catch((error) => {return console.error(error)})
	
	eventAssigner('.canvas-config', 'click', config).catch((error) => {return console.error(error)})
	eventAssigner('.canvas-remove', 'click', deletePanel).catch((error) => {return console.error(error)})
	eventAssigner('.form-select:not(#sel-bar-chart)', 'change', formSelect).catch((error) => {return console.error(error)})
	eventAssigner('html', 'click', configClose).catch((error) => {return console.error(error)})
}

async function getData(auto) {
    auto = (typeof auto == 'undefined') ? true : auto

	let pkg = {
		auto: auto
	}
	if(auto === false) {
		if(subSelected != undefined)
			pkg._id = (parseInt(subSelected.getAttribute('data-index')) > 0) ? subSelected.getAttribute('value') : null
		pkg.area = parseInt($e(`.panel[data-id="${idSelect}"] .area`)[$e(`.panel[data-id="${idSelect}"] .area`).selectedIndex].getAttribute('value'))
		pkg.direction = (parseInt($e(`.panel[data-id="${idSelect}"] .direction`)[$e(`.panel[data-id="${idSelect}"] .direction`).selectedIndex].getAttribute('value')) > 0)
				? parseInt($e(`.panel[data-id="${idSelect}"] .direction`)[$e(`.panel[data-id="${idSelect}"] .direction`).selectedIndex].getAttribute('value'))
				: null
		pkg.position = (parseInt($e(`.panel[data-id="${idSelect}"] .position`)[$e(`.panel[data-id="${idSelect}"] .position`).selectedIndex].getAttribute('value')) > 0)
				? parseInt($e(`.panel[data-id="${idSelect}"] .position`)[$e(`.panel[data-id="${idSelect}"] .position`).selectedIndex].getAttribute('value'))
				: null
	}

    await fetchTo(
		'http://localhost:999/metrics',
		'POST',
		pkg,
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
