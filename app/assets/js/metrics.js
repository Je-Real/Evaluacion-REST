let rec, showCharts, clone, idSelect = 0,
	showRegs = 5, year = parseInt(DATE.getFullYear()) - (showRegs-1),
	compareAll = false,
	barSearch, lastConfigPanel = -1

let fuzzyLock = true

/**
 * Show or hide the hints box below the input text
 * @param {*} e Event target
 * @param {Boolean} show Show the hints box (Default: true)
 * @returns
 */
 const modalHintDisplay = async(e, show = true) => {
	try {
		return setTimeout(() => {
			if(e.target)
				if(show) {
					let modalHint = e.target.parentElement.querySelector('.modal-hint')

					if(modalHint != null)
						modalHint.classList.remove('hide')

					return true
				} else {
					let modalHint = e.target.parentElement.querySelector('.modal-hint')

					if(modalHint != null) {
						modalHint.innerHTML = ''
						modalHint.classList.add('hide')
					}

					return true
				}
			else return false
		}, 200)
	} catch (error) {
		console.warn(error)
		throw false
	}
}

/**
 * Search by ID or name dynamically data from
 * a specific collection and retrieve information.
 * @param {*} e Event target
 * @param {*} collection Collection to search
 */
const dynamicHints = async(e, collection) => {
	if(fuzzyLock && e.target) {
		fuzzyLock = false
		setTimeout(() => {
			fetchTo(
				window.location.origin+'/admin-control/fuzzy-find',
				'POST',
				{ query: (e.target.value).trim(), collection: collection },
				(result) => {
					if(result.snack) {
						return showSnack(result.msg, null, 'warning')
					} else if(result.status === 200) {
						let textItterator = ''
						fuzzyLock = true

						if(result.data) {
							for(let d in result.data) {
								textItterator += `<div class="hints btn btn-outline-light py-2 px-4"
								data-name="${result.data[d].name}" data-id="${result.data[d]._id}">
								<p class="m-0 p-0 text-dark text-start pe-none">
									<span class="pe-2">ID: ${result.data[d]._id}</span> -
									<span class="ps-2">${result.data[d].name}</span>
								</p></div>`
							}
							let modalHint = e.target.parentElement.querySelector('.modal-hint')
							if(modalHint != null)
								modalHint.innerHTML = textItterator

							eventAssigner('.hints', 'click', (e) => {
								let input = e.target.parentElement.parentElement.querySelector('input')

								input.dataset['id'] = e.target.dataset['id']
								input.value = `${e.target.dataset['name']} - ${e.target.dataset['id']}`
								modalHintDisplay(e.target, false)
							})
						}
					}
				},
				(error) => {
					console.warn(error)
					return showSnack(error, null, 'error')
				}
			)
		}, 750)
	}
}

const setEventsSelector = (target = null) => {
	if(target == null) target = '.dynamic-hint'

	$a(target).forEach(node => {
		node.parentElement.insertAdjacentHTML(
			'beforeend',
			'<div class="modal-hint hide mt-1 bg-light rounded-3 shadow-lg"></div>'
		)
	})
	eventAssigner(target, 'focusin', (e) => modalHintDisplay(e, true))
	eventAssigner(target, 'focusout', (e) => modalHintDisplay(e, false))
	eventAssigner(target, 'keydown', (e) => dynamicHints(e, 'user_info'))
	eventAssigner(target, 'change', (e) => dynamicHints(e, 'user_info'))
}

const addAreaField = () => {
	let label = $e('#add-label').value.trim(),
		rnd = Math.random().toString(16).substring(2, 8)
	let id = `${label.split(' ')[0]}-${rnd}`

	try {
		$e('#addAreaField').insertAdjacentHTML('beforebegin',
		`<div id="_${id}" class="col-12 col-md-6 mb-3 mx-auto">
		<div class="row p-0 m-0">
		<div class="form-floating col-11 px-0">
		<input type="text" class="form-control dynamic-hint ps-4 mandatory area _${rnd}"
		data-type="areas" data-id="">
		<label><span>${label}</span>
		<span class="text-danger"><i class="fa-solid fa-asterisk"></i></span>
		</label></div>
		<div class="col-1 d-flex"><button id="remove-${id}" type="button" class="btn btn-close p-1
		m-auto" data-tooltip-es="Quitar este campo" data-tooltip-en="Remove this field"
		data-target="#_${id}"></button></div>
		</div></div>`
	)
	} catch (error) {
		console.error(error)
		return showSnack(error, null, 'error')
	} finally {
		setTimeout(() => {
			$e('#add-label').value = ''
			setEventsSelector(`.area._${rnd}`)
			eventAssigner(`#remove-${id}`, 'click', removeAreaField)
		}, 100);
	}
}

const removeAreaField = (e) => {
	let tgt = e.target
	$e(tgt.dataset['target']).remove()
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
	//barChartSearch()

	eventAssigner('#addPanel', 'click', addPanel).catch((error) => {return console.error(error)})
	//eventAssigner('#sel-bar-chart', 'change', barChartSearch).catch((error) => {return console.error(error)})
	if($e('#btn-all-report')) eventAssigner('#btn-all-report', 'click', () => generateFile('all'))
	eventAssigner('#btn-mono-report', 'click', () => generateFile('mono'))
	buttonListeners()

	setTimeout(() => {
		getData(true)
    }, 150)

	eventAssigner('html', 'click', configClose)

	if($e('#modalSelector')) {
		$a('#modalSelector .directorate, #modalSelector .a-directorate').forEach(node => {
			if('prefer' in node.dataset) {
				const select = node.dataset['prefer']
				node.querySelector(`option[value="${select}"]`).selected = true
			}
		})
		eventAssigner('#btn-mono-report', 'change', () => generateFile('mono'))
		eventAssigner('#addField', 'click', addAreaField)

		setEventsSelector()
	}
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
		$e(`.panel[data-id="${idSelect}"] .sub-def`).selected = true
		$e(`.panel[data-id="${idSelect}"] #lbl-name`).innerHTML = ''
	}
	const emptyArea = () => {
		$e(`.panel[data-id="${idSelect}"] .area-def`).selected = true
	}
	const emptyDirections = () => {
		$e(`.panel[data-id="${idSelect}"] .directorate-def`).selected = true
	}
	let tgt = e.target, canvasTitle

	// Get Id of the parent node of the select changed
	upperAttrIterator(tgt, 'data-id')
	.then(id => {
		idSelect = id
		canvasTitle = $e(`.panel[data-id="${idSelect}"] .canvasTitle`),
		getter = null

		if(tgt.classList.contains('areas')) {
			if(parseInt(tgt.value) == 0) return false

			emptyDirections()
			emptySubordinate()
			canvasTitle.innerHTML = tgt.options[tgt.selectedIndex].innerHTML
			getter = {area: parseInt(tgt.value)}
		}
		else if(tgt.classList.contains('directorates')) {
			if(parseInt(tgt.value) == 0) return false

			emptySubordinate()
			emptyArea()
			canvasTitle.innerHTML = tgt.options[tgt.selectedIndex].innerHTML
			getter = {directorate: parseInt(tgt.value)}
		}
		else if(tgt.classList.contains('subordinates')) { // Subordinates select
			emptyArea()
			emptyDirections()
			canvasTitle.innerHTML = Array('Personal a cargo', 'Personnel in charge')[lang]
			if(tgt.selectedIndex == 0) { // All subordinates option
				$e(`.panel[data-id="${idSelect}"] #lbl-name`).innerHTML = ''
				return getData(true, null)
			}

			// Get position of subordinate and split it
			subSelected = tgt.options[tgt.selectedIndex]
			$e(`.panel[data-id="${idSelect}"] #lbl-name`).innerHTML = subSelected.innerHTML
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
	eventUnassigner('.form-select:not(#sel-bar-chart):not(.selector)', 'change', formSelect)
		.catch((error) => {return console.error(error)})
	eventUnassigner('html', 'click', configClose).catch((error) => {return console.error(error)})

	eventAssigner('.canvas-config', 'click', config).catch((error) => {return console.error(error)})
	eventAssigner('.canvas-remove', 'click', deletePanel).catch((error) => {return console.error(error)})
	eventAssigner('.form-select:not(#sel-bar-chart):not(.selector)', 'change', formSelect)
		.catch((error) => {return console.error(error)})
	eventAssigner('html', 'click', configClose).catch((error) => {return console.error(error)})
}

async function getData(auto, getter = null) {
    auto = (typeof auto == 'undefined') ? true : auto

	let pkg = { auto: auto }
	if(getter != null) pkg = getter

    await fetchTo(
		window.location.origin+'/metrics',
		'POST',
		pkg,
		(result) => {
            if(result.console) log(result.console, 'warning')
			if(result.snack) showSnack(result.msg, null, 'info')

			if(result.status === 200) {
				if('area' in pkg) {
					if('subordinates' in result.data) { // Add new subordinates to select
						// Update subordinates select when change areas o directorates
						if(result.data.subordinates) {
							let longText = `.panel[data-id="${idSelect}"] .subordinates`
							$a(`${longText} .sub`).forEach(node => {
								node.remove()
							})
							$e(`${longText} .sub-def`).selected = true

							$e(longText).disabled = false
							$e(`${longText} .sub-def`).innerHTML = Array('Personal a cargo', 'Personnel in charge')[lang]

							for(let i in result.data.subordinates) {
								$e(longText).insertAdjacentHTML(
									'beforeend', `<option class="sub" data-index="${parseInt(i)+1}"`+
									`value="${result.data.subordinates[i]._id}">`+
									`${result.data.subordinates[i].position[lang]} `+
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
const barsMetrics = async() => { // The bar graph
	let canvasGetter = $e('#bars canvas')
	return canvasGetter.toDataURL().split(',')[1]
}

const generateFile = async(mode = '') => {
	spinner('wait', true)

	let REQ_PARAMS, pkg
	// The server gets no more the client graphs
	//$e('#layoutSidenav_content').classList.add('fixed-size')

	setTimeout(async() => {
		let lockSend = false

		switch (mode) {
			case 'all':
				pkg = {
					mode: 'all',
					data: {
						directorates: [],
						areas: [],
						a_directorates: []
					}
				}

				$a('#modalSelector .form-control').forEach(node => {
					if(!lockSend) {
						if(node.classList.contains('mandatory')) {
							if(!String(node.value).trim().length || node.value == '0') {
								showSnack(
									[
										`No se ha podido obtener los datos del campo "${
											node.nextElementSibling.querySelector('span').innerHTML
										}". Vuelve a seleccionar la información e intenta de nuevo.`,
										`Field data could not be obtained from "${
											node.nextElementSibling.querySelector('span').innerHTML
										}". Select again the information and try again.`
									], null, 'warning'
								)
								lockSend = true
							}
						}

						let description = node.parentElement.querySelector('label span:first-child').innerHTML

						if(node.tagName.toLowerCase() == 'select') {
							if(String(node.value).trim().length)
								pkg.data[node.dataset.class].push({
									_id: parseInt(node.value),
									description: description
								})
						} else {
							if(String(node.dataset.id).trim().length)
								pkg.data[node.dataset.class].push({
									_id: String(node.dataset.id).trim(),
									description: description
								})
							else if(String(node.value).split('-').length > 1) {
								pkg.data[node.dataset.class].push({
									_id: String(node.value).split('-')[1].trim(),
									description: description
								})
							}
						}
					}
				})
				break

			case 'mono':
				pkg = {
					mode: 'mono',
					data: {}
				}

				$a('.panel').forEach(canvas => {
					if(canvas.querySelector('.areas').value != '0') {
						let node = canvas.querySelector('.areas')
						if(!('areas' in pkg.data)) pkg.data['areas'] = []
						return pkg.data.areas.push({
							_id: parseInt(node.value),
							description: node[node.selectedIndex].innerHTML.trim()
						})
					}
					if(canvas.querySelector('.directorates').value != '0') {
						let node = canvas.querySelector('.directorates')
						if(!('directorates' in pkg.data)) pkg.data['directorates'] = []
						return pkg.data.directorates.push({
							_id: parseInt(node.value),
							description: node[node.selectedIndex].innerHTML.trim()
						})
					}
					if(canvas.querySelector('.subordinates').value == '0') {
						let node = canvas.querySelector('.subordinates')
						if(!('manager' in pkg.data)) pkg.data['manager'] = []
							return pkg.data.manager.push({
								_id: parseInt(node.value),
								description: node[node.selectedIndex].innerHTML.trim()
							})
					} else {
						let node = canvas.querySelector('.subordinates')
						if(!('subordinates' in pkg.data)) pkg.data['subordinates'] = []
							return pkg.data.subordinates.push({
							_id: parseInt(node.value),
							description: node[node.selectedIndex].innerHTML.trim()
						})
					}
				})

				break

			default:
				return showSnack(
					Array('No se recibieron parámetros en la solicitud de descarga',
						'No parameters has been received in download request')[lang],
						null, 'error'
				)
		}

		if(lockSend) return spinner('wait', false)

		REQ_PARAMS = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(pkg)
		}

		await fetch(window.location.origin+'/metrics/print', REQ_PARAMS)
		.then(async data => {
			if(data.status != 401) {
				let SNK_Type = '',
					filename = data.headers.get('filename')

				if(data.status === 200) SNK_Type = 'success'
				else SNK_Type = 'warning'
				if(Boolean(data.headers.get('snack')) == true) {
					showSnack(data.headers.get('msg'), null, SNK_Type)
				}

				data.arrayBuffer()
				.then(data => {
					if(data == null || data == undefined)
					return showSnack('Server error', null, 'error')
					const blob = new Blob([data]) // Create a Blob object
					const url = URL.createObjectURL(blob) // Create an object URL
					download(url, filename) // Download file
					URL.revokeObjectURL(url) // Release the object URL
				})
			} else showSnack(data.headers.get('msg'), null, 'error')
		})
		.catch(error => {
			console.error(error)
			showSnack(
				Array('Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte',
					'Please open the browser console, copy the error and contact a support specialist.')[lang],
				null, 'error'
			)
		})
		.finally(() => {
			//$e('#layoutSidenav_content').classList.remove('fixed-size')
			spinner('wait', false)
		})
	}, 150)
}
