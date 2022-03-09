window.addEventListener('load', async() => {
	eventAssigner('.btn-edit', 'click', editInfo)
	eventAssigner('.btn-cancel', 'click', cancelInfo)
	eventAssigner('.btn-save', 'click', updateInfo)
	eventAssigner('input:not(.read-only)', 'change', highlighter)

	eventAssigner('#tables-opts .dropdown-item', 'click', extraTables)
})

const editInfo = (e) => {
	// Edit a user info, show buttons & set a restore point for all inputs in case of cancel
	let tgt = e.target.getAttribute('data-id')

	if((tgt).length) {
		$a(`.${tgt}:not(.read-only)`).forEach(node => {
			node.disabled = false

			if(node.type === 'checkbox')
				node.setAttribute('data-restore', node.checked)
			else
				node.setAttribute('data-restore', node.value)
		})
		$a(`#save-${tgt}, #cancel-${tgt}`).forEach(node => {
			node.classList.remove('d-none')
			node.disabled = false
		})
		$e(`#edit-${tgt}`).classList.add('d-none')
		$e(`#edit-${tgt}`).disabled = true
	} else
		return log(`[AD-CTRL] Not found ID target in button event (target = ${tgt})`, STYLE.error)
}

const cancelInfo = (e) => {
	// Cancel the current operation (lock inputs) & restore the original values
	let tgt = e.target.getAttribute('data-id')

	$a(`.${tgt}.edited`).forEach(node => {
		if(node.type === 'checkbox')
			node.checked = node.dataset.restore
		else
			node.value = node.dataset.restore
		node.removeAttribute('data-restore')
		node.classList.remove('edited')
	})

	$a(`.${tgt}:not(.read-only)`).forEach(node => {
		node.disabled = true
	})
	$a(`#save-${tgt}, #cancel-${tgt}`).forEach(node => {
		node.classList.add('d-none')
		node.disabled = true
	})
	$e(`#edit-${tgt}`).classList.remove('d-none')
	$e(`#edit-${tgt}`).disabled = false
}

const updateInfo = (e) => {
	// Save the information 🤠
	let tgt = e.target.getAttribute('data-id'),
		pkg = {
			_id: e.target.getAttribute('data-id'),
			collection: parseInt(e.target.getAttribute('data-table'))
		}

	if(String(tgt).length) {
		switch(pkg.collection) {
			case 1:
				$a(`.${tgt}.edited`).forEach(node => {
					if(node.dataset.class == 'user_all' || node.dataset.class == 'user') {
						if(!('user' in pkg)) pkg['user'] = {} // if not exists user
						pkg.user[node.name] = node.value || node.checked
					}
					if(node.dataset.class == 'user_all' || node.dataset.class == 'user_info') {
						if(!('user_info' in pkg)) pkg['user_info'] = {} // if not exists user_info
						pkg.user_info[node.name] = node.value || node.checked
					}
					if(node.dataset.class == 'evaluation') {
						if(node.checked == true) {
							if(!('evaluation' in pkg))
								pkg['evaluation'] = { records: {} } // if not exists evaluation.records
							if(!(node.dataset.year in pkg.evaluation.records))
								pkg.evaluation.records[node.dataset.year] = { disabled: true } // and the years
						} else {
							if(!('rm_evaluation' in pkg)) pkg['rm_evaluation'] = {} // if not exists rm_evaluation
							pkg.rm_evaluation[`records.${node.dataset.year}`] = ''
						}
					}
				})
				break

			case 2:
				pkg['area'] = { description : [] }
				$a(`input.${tgt}`).forEach(node => {
					pkg.area.description[parseInt(node.name)] = node.value
				})
				break

			case 3:
				pkg['direction'] = { description : [] }
				$a(`input.${tgt}`).forEach(node => {
					pkg.direction.description[parseInt(node.name)] = node.value
				})
				break

			case 4:
				pkg['position'] = { description : [] }
				$a(`input.${tgt}`).forEach(node => {
					pkg.position.description[parseInt(node.name)] = node.value
				})
				break

			case 5:
				pkg['category'] = { description : [] }
				$a(`input.${tgt}`).forEach(node => {
					pkg.category.description[parseInt(node.name)] = node.value
				})
				break
		}

		delete pkg['collection']

		fetchTo(
			'http://localhost:999/admin-control/update',
			'POST',
			pkg,
			(result) => {
				if(result.status === 200) {
					showSnack((lang == 0) ? 'Cambios guardados' : 'Changes saved', null, SNACK.success)
					$a(`.${tgt}:not(.read-only)`).forEach(node => {
						node.disabled = true
					})
					$a(`#save-${tgt}, #cancel-${tgt}`).forEach(node => {
						node.classList.add('d-none')
						node.disabled = true
					})
					$e(`#edit-${tgt}`).classList.remove('d-none')
					$e(`#edit-${tgt}`).disabled = false
				} else
					showSnack(result.error, null, SNACK.error)
			},
			(error) => {
				console.error(error)
			}
		)

		// TODO: Send new data to update the DB
	} else
		return log(`[AD-CTRL] Not found ID target in button event (target = ${tgt})`, STYLE.error)
}

const highlighter = (e) => {
	// Highlight the inputs that had been modified
	let tgt = e.target

	if('restore' in tgt.dataset) {
		if(tgt.value == tgt.getAttribute('data-restore'))
			tgt.classList.remove('edited')
		else
			tgt.classList.add('edited')
	}
}

const extraTables = (e) => {
	let search = e.target.dataset.table,
		lblText = e.target.innerHTML

	if(search > 1) {
		fetchTo(
			'http://localhost:999/admin-control/search',
			'POST',
			{search: search},
			(result) => {
				if(result.status === 200) {
					$e('#tables-opts .dropdown-item:disabled').disabled = false
					e.target.disabled = true

					$e('#extra').classList.remove('d-none')
					$e('#personnel-table').classList.add('d-none')

					$e('#extra-accordion').innerHTML = ''
					$e('#extra .lang').innerHTML = lblText
					if(result.data.length) {
						for(let i in result.data) {
							$e('#extra-accordion').insertAdjacentHTML(
								'afterbegin',
								`<div class="accordion-item">
									<h2 class="accordion-header" id="flush-head-area-e-${ result.data[i]['_id'] }">
										<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
											data-bs-target="#flush-area-e-${ result.data[i]['_id'] }" aria-expanded="false"
											aria-controls="flush-area-e-${ result.data[i]['_id'] }">
											<div class="item-header d-flex w-100">
												<div class="text-center p-0 col-2 d-flex">
													<p class="m-0">ID: ${ result.data[i]['_id'] }</p>
												</div>
												<div class="text-right p-0 ms-auto me-2">
													<p class="m-0 lang" data-lang="es">
													${ (result.data[i]['description'][lang]) ? result.data[i]['description'][lang] : result.data[i]['description'][0] }
													</p>
												</div>
											</div>
										</button>
									</h2>
									<div id="flush-area-e-${ result.data[i]['_id'] }" class="accordion-collapse collapse"
										aria-labelledby="flush-head-area-e-${ result.data[i]['_id'] }" data-bs-parent="#extra-accordion">
										<div class="accordion-body px-3">
											<div class="row">
												<div class="my-1 col-md-6 col-12 mx-auto">
													<p class="text-mini-label text-center m-0">
														${ (lang == 0) ? 'Idioma (es)' : 'Language (es)' }
													</p>
													<input value="${ result.data[i]['description'][0] }" class="form-control e-${ result.data[i]['_id'] }"
														name="0" id="area-es-e-${ result.data[i]['_id'] }" type="text" disabled>
												</div>
												<div class="my-1 col-md-6 col-12 mx-auto">
													<p class="text-mini-label text-center m-0">
													${ (lang == 0) ? 'Idioma (en)' : 'Language (en)' }
													</p>
													<input value="${ (result.data[i]['description'][1]) ? result.data[i]['description'][1] : '' }"
														name="1" class="form-control e-${ result.data[i]['_id'] }" id="area-en-e-${ result.data[i]['_id'] }"
														type="text" disabled>
												</div>
											</div>

											<div class="w-100 text-right d-flex justify-content-end mt-2 pe-3">
												<button id="edit-e-${ result.data[i]['_id'] }" data-id="e-${ result.data[i]['_id'] }" data-table="${search}"
													class="btn-edit btn btn-secondary px-3 py-2">
													<i class="pe-none pe-1 fa-solid fa-pen-to-square"></i>
													<span class="pe-none lang">
														${(lang == 0) ? 'Editar' : 'Edit' }
													</span>
												</button>
												<button id="cancel-e-${ result.data[i]['_id'] }" data-id="e-${ result.data[i]['_id'] }" data-table="${search}"
													class="btn-cancel btn btn-outline-danger px-3 py-2 me-2 d-none" disabled>
													<i class="pe-none pe-1 fa-solid fa-ban"></i>
													<span class="pe-none lang">
														${(lang == 0) ? 'Cancelar' : 'Cancel' }
													</span>
												</button>
												<button id="save-e-${ result.data[i]['_id'] }" data-id="e-${ result.data[i]['_id'] }" data-table="${search}"
													class="btn-save btn btn-outline-dark px-3 py-2 d-none" disabled>
													<i class="pe-none pe-1 fa-solid fa-floppy-disk"></i>
													<span class="pe-none lang">
														${(lang == 0) ? 'Guardar' : 'Save' }
													</span>
												</button>
											</div>
										</div>
									</div>
								</div>`
							)
						}

						eventUnassigner('.btn-edit', 'click', editInfo)
						eventUnassigner('.btn-cancel', 'click', cancelInfo)
						eventUnassigner('.btn-save', 'click', updateInfo)
						eventUnassigner('input:not(.read-only)', 'change', highlighter)

						eventAssigner('.btn-edit', 'click', editInfo)
						eventAssigner('.btn-cancel', 'click', cancelInfo)
						eventAssigner('.btn-save', 'click', updateInfo)
						eventAssigner('input:not(.read-only)', 'change', highlighter)
					} else {
						$e('#extra-accordion').insertAdjacentHTML(
							'afterbegin',
							`<td id="empty" colspan="5" class="border-0 text-center">
								<div class="text-center">
									<i class="fa-solid fa-ghost icon-ghost f-vScreen-15 my-3 text-black-15"></i>
									<p class="my-2 text-ghost fs-4">
										<span class="lang" data-lang="es">No hay datos para mostrar</span>
										<span class="lang" data-lang="en">No records to show</span>
									</p>
								</div>
							</td>`
						)
					}
				} else showSnack(result.error, null, SNACK.error)
			},
			(error) => console.error(error)
		)
	} else {
		$e('#extra').classList.add('d-none')
		$e('#personnel-table').classList.remove('d-none')

		$e('#tables-opts .dropdown-item:disabled').disabled = false
		$e('#tables-opts .dropdown-item:first-child').disabled = true
	}
}