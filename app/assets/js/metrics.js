let rec, showCharts, clone, idSelect = 0,
	showRegs = 5, year = parseInt(DATE.getFullYear()) - (showRegs-1),
	compareAll = false,
	barSearch, lastConfigPanel = -1

const barChartSearch = () => {
	barSearch = $e('#sel-bar-chart').value

	if(barSearch == 0) {
		$e('#bars').classList.remove('ext')
		barSearch = 'area'
	}else {
		$e('#bars').classList.add('ext')
		barSearch = 'direction'
	}

	fetchTo(
		'http://localhost:999/metrics/all',
		'POST',
		{ search: barSearch },
		(result) => {
			if(result.snack === true) {
				showSnack(result.msg, null, result.snackType)
			}

			if(result.status === 200) {
				if(result.data.length) {
					let barLabels = [],
						barData = []

					for(let i in result.data) {
						barLabels.push(result.data[i].description[lang])
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
			showSnack('Error '+error, null, 'error')
			console.error(error)
		}
	)
}

window.addEventListener('load', async(e) => {
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
	eventAssigner('#btn-all-report', 'click', () => generatePDF('all'))
	eventAssigner('#btn-mono-report', 'click', () => generatePDF('mono'))
	buttonListeners()

	setTimeout(() => {
		getData(true)
    }, 150)

	eventAssigner('html', 'click', configClose)
})

function displayCharts(show, idElement) {
	if(!isNaN(parseInt(idElement))) {
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
			//log(`[Metrics] Shown Panel ${idElement}`, 'cian')
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
			//log(`[Metrics] Hidden Panel ${idElement}`, 'pink')
		}
	} else {
		if(show) $e(idElement).classList.replace('d-none', 'd-block')
		else $e(idElement).classList.replace('d-block', 'd-none')
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

// Closes the configuration menu of each panel when clicks outside, for example.
const configClose = (e) => {
	if(
		!e.target.matches('.canvas-config.animate')
		&& !e.target.closest(`.panel[data-id="${lastConfigPanel}"] .config-menu`)
	) {
		$a('.config-menu.d-block').forEach(node => {
			node.classList.replace('d-block', 'd-none')
		})
		$a('.canvas-config.animate').forEach(node => {
			node.classList.remove('animate')
		})
	}
}

const formSelect = (e) => { // All .forms-select that isn't #sel-bar-chart
	const emptySubordinate = () => {
		$e(`.panel[data-id="${idSelect}"] .subordinates`).classList.add('d-none')
		$e(`.panel[data-id="${idSelect}"] .sub-def`).selected = true
	}
	const emptyArea = () => {
		$e(`.panel[data-id="${idSelect}"] .area-def`).selected = true
	}
	const emptyDirections = () => {
		$e(`.panel[data-id="${idSelect}"] .direction-def`).selected = true
	}
	let tgt = e.target, canvasTitle

	// Get Id of the parent node of the select changed
	upperAttrIterator(tgt, 'data-id')
	.then(id => {
		idSelect = id
		canvasTitle = $e(`.panel[data-id="${idSelect}"] .canvasTitle`),
		getter = null

		if(tgt.classList.contains('areas')) {
			if(tgt.value == 0) {
				$e(`.panel[data-id="${idSelect}"] .subordinates`).classList.remove('d-none')
			} else {
				emptyDirections()
				emptySubordinate()
				canvasTitle.innerHTML = tgt.options[tgt.selectedIndex].innerHTML
				getter = {area: tgt.value}
			}
		}
		else if(tgt.classList.contains('directions')) {
			emptySubordinate()
			emptyArea()
			canvasTitle.innerHTML = tgt.options[tgt.selectedIndex].innerHTML
			getter = {direction: tgt.value}
		}
		else if(tgt.classList.contains('subordinates')) { // Subordinates select
			emptyArea()
			emptyDirections()
			subSelected = tgt.options[tgt.selectedIndex]

			if(tgt.selectedIndex > 0) { // Get name of subordinate and split it
				let nameArray = ((subSelected.innerHTML).trim()).split(' ')
				nameArray.length = parseInt((nameArray.length / 2)+0.5)
				canvasTitle.innerHTML = nameArray.join(' ')
			} else // Else the title will be...
				canvasTitle.innerHTML = Array('Personal a cargo', 'Personnel in charge')[lang]
			getter = {_id: tgt.value}
		} 
		else return false

		getData(false, getter)
	})
	.catch(error => {
		console.error(error)
	})
}

const addPanel = () => {
	idSelect = parseInt($e('.panel:last-of-type').getAttribute('data-id'))+1
	let panelsDisplayed = parseInt($a('.panel').length)

	if(compareAll) {
		showSnack(
			Array('Comparar todas las areas', 'Compare all areas')[lang],
			null, 'info'
		)
	} else {
		if(panelsDisplayed < 10 && !compareAll) {
			clone.setAttribute('data-id', String(idSelect))
			$e('#panelContainer').appendChild(clone)

			displayCharts(false, idSelect)
			mainToolTip()
			buttonListeners()
			clone = $e('.panel:last-of-type').cloneNode(true)
			idSelect = -1
		} else
			showSnack(
				Array('El limite son 10 paneles', 'The limit is 10 panels')[lang],
				null, 'warning'
			)
	}
}

const deletePanel = (e) => {
	let tgt = e.target

	upperAttrIterator(tgt, 'data-id')
	.then(idDeletable => {
		if(idDeletable != 0) {
			$e(`.panel[data-id="${idDeletable}"]`).remove()
		}
		else showSnack(
			Array('No puedes eliminar el panel principal 😡',
				'You cannot delete the main panel 😡')[lang],
			null, 'error'
		)
	})
	.catch(error => console.error(error))
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

async function getData(auto, getter = null) {
    auto = (typeof auto == 'undefined') ? true : auto

	let pkg = { auto: auto }

	if(getter != null) {
		pkg = getter
		// If select subordinates is different from default
		if($e(`.panel[data-id="${idSelect}"] .subordinates`).value != '0')
			pkg._id = $e(`.panel[data-id="${idSelect}"] .subordinates`).value
		// Else if select area is different from default
		else if(parseInt($e(`.panel[data-id="${idSelect}"] .area`).value) > 0)
			pkg.area = parseInt($e(`.panel[data-id="${idSelect}"] .area`).value)
		// Else if select direction is different from default
		else if(parseInt($e(`.panel[data-id="${idSelect}"] .direction`).value) > 0)
			pkg.direction = parseInt($e(`.panel[data-id="${idSelect}"] .direction`).value)
		else
			return showSnack(Array('No se enviaron datos', 'No data sent')[lang], null, 'warning')
	}

    await fetchTo(
		'http://localhost:999/metrics',
		'POST',
		pkg,
		(result) => {
            if(result.console) log(result.console, 'warning')

			if(result.snack) showSnack(
				result.msg,
				null, 'info'
			)

			if(result.status === 200) {
				if('area' in pkg) {
					if('subordinates' in result.data) { // Add new subordinates to select
						let longText = `.panel[data-id="${idSelect}"] .subordinates`
						$a(`${longText} .sub`).forEach(node => {
							node.remove()
						})
						$e(`${longText} .sub-def`).selected = true
	
						if(result.data.subordinates) {
							$e(longText).disabled = false
							$e(`${longText} .sub-def`).innerHTML = Array('-Selecciona personal-', '-Select personnel-')[lang]
	
							for (let i in result.data.subordinates) {
								$e(longText).insertAdjacentHTML(
									'beforeend', `<option class="sub" data-index="${parseInt(i)+1}"`+
									`value="${result.data.subordinates[i]['_id']}">`+
									`${result.data.subordinates[i]['name']} `+
									`</option>`
								)
							}
						}
					} else { // But if there's no data...
						$e(longText).disabled = true
						$e(`${longText} .sub-def`).innerHTML = Array('Sin registros', 'No records')[lang]
					}
				}

				if(result.data.total != 0 && result.data.log.records != 0) { // Data that will be sent to graphs
					try {
						let lineLabels = []
						for(let i in result.data.log.years) {
							lineLabels.push([
								result.data.log.years[i],
								(result.data.log.records[i] > 0 || result.data.log.records[i] != false)
								? '[ ' + result.data.log.records[i] + '% ]'
								: '[ N.A. ]'
							])
						}

						semiDoughnutChart(idSelect, result.data.total)
						lineChart(idSelect, lineLabels, result.data.log.records)
						displayCharts(true, idSelect)
					}
					catch (error) {
						displayCharts(false, idSelect)
						console.error(error)
					}

					idSelect = -1 // Deselect the current canvas
				} else displayCharts(false, idSelect)
			}
			else {
				if(result.log === true) return log('[Metrics] '+result.msg, 'error')
			}
			canvasId = undefined
        },
		(error) => {
			showSnack('Error '+error, null, 'error')
			console.error(error)
			canvasId = undefined
		}
	)
}

// Get the image (canvas) of
const monoMetrics = async() => { // All the individual graphs
	let metrics = {}, length = 0

	$a('.lienzos').forEach(async(node, i) => {
		let semi = node.querySelector('.semiDoughnutChart canvas'),
			line = node.querySelector('.lineChart canvas'),
			divisible = i % 2

		if(!(`${length}` in metrics)) metrics[`${length}`] = {}

		metrics[`${length}`][`${divisible}`] = {
			title: node.querySelector('.canvasTitle').innerHTML.trim(),
			semi: await semi.toDataURL().split(',')[1],
			score: node.querySelector('.semiDoughnutChart span').innerHTML.trim(),
			line: line.toDataURL().split(',')[1]
		}
		if(divisible) length++
	})

	return metrics
}
const polyMetrics = async() => { // The bar graph
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
					Array('No se recibieron parámetros en la solicitud de descarga',
						'No parameters has been received in download request')[lang],
						null, 'error'
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
				return showSnack('Server error', null, 'error')
			const blob = new Blob([data]) // Create a Blob object
			const url = URL.createObjectURL(blob) // Create an object URL
			download(url, Array(`formato-evaluacion-.pdf`, `evaluation-format-.pdf`)[lang]) // Download file
			URL.revokeObjectURL(url) // Release the object URL
		})
		.catch(err => {
			showSnack(
				Array('Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte',
					'Please open the browser console, copy the error and contact a support specialist.')[lang],
				null, 'error'
			)
			console.error(err)
		})
		.finally(() => {
			$e('#layoutSidenav_content').classList.remove('fixed-size')
		})
	}, 150)
}
