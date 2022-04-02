let fuzzyLock = true

window.addEventListener('load', async(e) => {
	hintMain()
})

const hintMain = () => {
	$a('.dynamic-hint').forEach(node => {
		let parentNode = 'hint-'+Math.random().toString(16).substring(2, 8)
		node.setAttribute('data-hint-id', parentNode)
		node.parentElement.insertAdjacentHTML(
			'beforeend',
			`<div id="${parentNode}" class="modal-hint hide mt-1 bg-light rounded-3 shadow-lg"></div>`
		)
	})

	eventAssigner('.dynamic-hint', 'focusin', e => modalHintDisplay(e, true))
	eventAssigner('.dynamic-hint', 'focusout', e => modalHintDisplay(e, false, true))
	eventAssigner('.dynamic-hint', 'keydown', e => dynamicHints(e, 'user_info'))
	eventAssigner('.dynamic-hint', 'change', e => dynamicHints(e, 'user_info'))
}

/**
 * Show or hide the hints box below the input text
 * @param {*} e Event target
 * @param {Boolean} show Show the hints box (Default: true)
 * @returns
 */
const modalHintDisplay = async(e, show = true, auto = false) => {
	try {
		setTimeout(() => {
			if(e.target) {
				if(show) {
					let modalHint = e.target.parentElement.querySelector('.modal-hint')

					if(modalHint != null)
						modalHint.classList.remove('hide')
				} else {
					let modalHint = e.target.parentElement.querySelector('.modal-hint')
	
					if(modalHint != null) {
						modalHint.classList.add('hide')
						if(!auto) modalHint.innerHTML = ''
					}
				}
			}
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
	let query = (e.target) ? e.target.value.trim() : String(e).trim()

	if(fuzzyLock && query) {
		fuzzyLock = false

		setTimeout(() => {
			fetchTo(
				window.location.origin+'/admin-control/fuzzy-find',
				'POST',
				{ query: query, collection: collection },
				(result) => {
					if(result.snack) {
						return showSnack(result.msg, null, 'warning')
					} else if(result.status === 200) {
						let textIterator = ''
						
						if(result.data) {
							for(let d in result.data) {
								textIterator += `<div class="w-100 hints btn btn-outline-light py-2 px-4"
								data-name="${result.data[d].name}" data-id="${result.data[d]._id}">
								<p class="m-0 p-0 text-dark text-start pe-none">
									<span class="pe-2">ID: ${result.data[d]._id}</span> -
									<span class="ps-2">${result.data[d].name}</span>
								</p></div>`
							}
							let modalHint = e.target.parentElement.querySelector('.modal-hint')
							if(modalHint)
								modalHint.innerHTML = textIterator
						}
					}
				},
				(error) => {
					console.warn(error)
					return showSnack(error, null, 'error')
				}
			).finally(() => {
				fuzzyLock = true
	
				// Get the values once the user clicks the hints and set
				// the values automatically depending on the input dataset
				eventAssigner('.hints', 'click', (e) => {
					let tgt = e.target, input,
						parentID = tgt.parentElement.id,
						_id = e.target.dataset['id'],
						name = e.target.dataset['name']
					
					input = $a(`input.dynamic-hint[data-hint-id="${parentID}"]`)
					if('hintSiblings' in input[0].dataset) {
						input = $a(`input.dynamic-hint[data-hint-siblings="${
							input[0].dataset['hintSiblings']
						}"]`)
					}
	
					if(input) {
						input.forEach(el => {
							let passInput = true
							switch (el.dataset['hintDisplay']) {
								case 'all':
									el.value = `${_id} - ${name}`
									break
								case 'id':
									el.value = _id
									break
								case 'name':
									el.value = name
									break
							
								default:
									passInput = false
									showSnack(
										Array(
											'No se encontró "hint-display". Omitiendo valores de "Input"',
											'"hint-display" not found. Skipping "Input" values')[lang],
										'Hints.js', 'warning'
									)
									break
							}
							
							if(passInput) {
								if(el.dataset.hintTarget == 'id')
									el.setAttribute('data-id', _id)
								else if(el.dataset.hintTarget == 'name')
									el.setAttribute('data-name', name)
								else showSnack(
									Array(
										'No se encontró "id" o "name" en el dataset. Omitiendo valores de "Input"',
										'"id" or "name" not found in dataset. Skipping "Input" values')[lang],
									'Hints.js', 'warning'
								)
							}
							
							modalHintDisplay(e.target, false)
						})
					}
				})
			})
		}, 200)
	}
}