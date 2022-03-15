window.addEventListener('load', async() => {
	eventAssigner('#tables-opts .dropdown-item', 'click', collections)
	$e('#tables-opts .dropdown-item[data-table="1"]').click()
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

const collections = (e) => {
	let search = e.target.dataset.table,
		lblText = e.target.innerHTML

	if(search) {
		fetchTo(
			'http://localhost:999/admin-control/search',
			'POST',
			{search: search},
			(result) => {
				if(result.status === 200) {
					if($e('#tables-opts .dropdown-item:disabled'))
						$e('#tables-opts .dropdown-item:disabled').disabled = false
					e.target.disabled = true

					$e('#collector-accordion').innerHTML = ''
					$e('#collector .lang').innerHTML = lblText
					if(result.data.length) {
						if(search == 1) {
							for(let i in result.data) {
								let evalRecords = ''

								if('eval_' in result.data[i])
									if(Object.keys(result.data[i].eval_.records).length != 0) {
										for(let year in result.data[i].eval_.records) {
											evalRecords += `<div class="my-1 col-md-6 col-12 accordion accordion-flush" id="user-eval-${ year }-${ result.data[i]._id }">
												<div class="accordion-item">
													<h2 class="accordion-header" id="user-flush-eval-${ year }-${ result.data[i]._id }">
														<button class="btn-outline-success accordion-button collapsed" type="button" data-bs-toggle="collapse"
														data-bs-target="#user-flush-eval-${ year }-collapse-${ result.data[i]._id }" aria-expanded="false"
														aria-controls="user-flush-eval-${ year }-collapse-${ result.data[i]._id }">
															${ Array('Año', 'Year')[lang] }
														</button>
													</h2>
													<div id="user-flush-eval-${ year }-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
														aria-labelledby="user-flush-eval-${ year }-${ result.data[i]._id }"
														data-bs-parent="#flush-eval-collapse-${ result.data[i]._id }">
														<div class="accordion-body px-0">
															<div class="row">
																<div class="my-1 col-md-4 col-6">
																	<p class="text-mini-label text-center m-0">
																		${ Array('Habilitado', 'Enabled')[lang] }
																	</p>
																	<div class="container ps-3">
																		<div class="button b2 mt-2 mb-2" id="button-17">
																			<input name="disabled" id="disabled-${ year }-${ result.data[i]._id }" type="checkbox"
																				class="checkbox info-${ result.data[i]._id } ${ (parseInt(year) != currYear) ? 'read-only' : '' }"
																				data-class="evaluation" data-year="${ year }"
																				${ ('disabled' in result.data[i].eval_.records[year]) ? '' : checked } }
																				disabled>
																				<div class="knobs" data-unchecked="${ Array('Sí', 'Yes')[lang] }"
																					data-checked="${ Array('No', 'No')[lang] }"><span></span></div>
																			<div class="layer"></div>
																</div></div></div>
																<div class="my-1 col-md-4 col-6">
																	<p class="text-mini-label text-center m-0">
																		${ Array('Puntuación', 'Score')[lang] }
																	</p>
																	<input value="${ result.data[i].eval_.records[year].score }"
																		class="form-control info-${ result.data[i]._id } read-only"
																		name="score" id="score-${ year }-${ result.data[i]._id }"
																		data-class="evaluation" data-year="${ year }" type="text" disabled>
																</div><div class="my-1 col-md-4 col-6">
																	<p class="text-mini-label text-center m-0">
																		${ Array('Respuestas', 'Answers')[lang] }
																	</p>
																	<input value="${ result.data[i].eval_.records[year].answers }"
																		class="form-control info-${ result.data[i]._id } read-only"
																		name="answers" id="answers-${ year }-${ result.data[i]._id }"
																		data-class="evaluation" data-year="${ year }" type="text" disabled>
																</div><div class="my-1 col-md-4 col-6 mx-auto">
																	<p class="text-mini-label text-center m-0">
																		${ Array('Área', 'Area')[lang] }
																	</p>
																	<input value="${ result.data[i].eval_.records[year].area }"
																		class="form-control info-${ result.data[i]._id } read-only"
																		name="area" id="area-${ year }-${ result.data[i]._id }"
																		data-class="evaluation" data-year="${ year }" type="text" disabled/>
																</div>
																${ ('department' in result.data[i].eval_.records[year])
																	?`<div class="my-1 col-md-4 col-6 mx-auto">
																		<p class="text-mini-label text-center m-0">
																			${ Array('Departamento', 'Department')[lang] }
																		</p>
																		<input value="${ result.data[i].eval_.records[year].direction }"
																			class="form-control info-${ result.data[i]._id } read-only"
																			name="department" id="department-${ year }-${ result.data[i]._id }" data-class="evaluation"
																			data-year="${ year }" type="text" disabled/>
																	</div>` : ''
																} ${ ('career' in result.data[i].eval_.records[year])
																	? `<div class="my-1 col-md-4 col-6 mx-auto">
																		<p class="text-mini-label text-center m-0">
																			${ Array('Carrera', 'Career')[lang] }
																		</p>
																		<input value="${ result.data[i].eval_.records[year].position }"
																			class="form-control info-${ result.data[i]._id } read-only"
																			name="career" id="career-${ year }-${ result.data[i]._id }" data-class="evaluation"
																			data-year="${ year }" type="text" disabled/>
																	</div>` : ''
																}
											</div></div></div></div></div>`
										}
									} else { 
										evalRecords = `<div class="col-12 text-center text-black-50"><p class="fs-4">
												${ Array('No hay registros', 'No records')[lang] }
											</p></div>`
									}

								$e('#collector-accordion').insertAdjacentHTML(
									'beforeend',
									`<div class="accordion-item">
										<h2 class="accordion-header" id="flush-collector-${ result.data[i]._id }">
											<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
											data-bs-target="#flush-collector-collapse-${ result.data[i]._id }" aria-expanded="false"
											aria-controls="flush-collector-collapse-${ result.data[i]._id }">
												<div class="item-header d-flex w-100">
													<div class="text-center p-0 col-3 d-flex"> <p class="m-0">ID: ${ result.data[i]._id }</p> </div>
													<div class="text-center p-0 mx-2"> <p class="m-0">${ result.data[i].name }</p> </div>
													<div class="text-right p-0 ms-auto me-2">
														<p class="m-0">${ 
															(result.data[i].enabled)
															? Array('Habilitado', 'Enabled')[lang]
															: Array('Deshabilitado', 'Disabled')[lang]
														}</p>
										</div></div></button></h2>
										<div id="flush-collector-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
											aria-labelledby="flush-collector-${ result.data[i]._id }" data-bs-parent="#collector-accordion">
											<div class="accordion-body px-3">
												<div class="my-md-2 my-1 px-md-3 py-md-2 p-2 rounded-3">
													<div class="row">
														<h6 class="col-12 p-0 text-black-50 fs-5">
															${ Array('Información de puesto', 'Position information')[lang] }</span>
														</h6>
														${ (false) ? `<div class="col-12"><h6 class="p-0 text-black-50 fs-5">
																	${ Array('Información de puesto', 'Position information')[lang] }
																</h6></div>` : ''
														}
														<div class="my-1 col-md-6 col-12">
															<p class="text-mini-label text-center m-0">
																${ Array('Área de adscripción', 'Adscription area')[lang] }
															</p>
															<input value="${ ((result.data[i].area).length)
																? (('description' in result.data[i].area[lang])
																	? result.data[i].area[lang].description
																	: 'N.A')
																: 'N.A' }"
																class="form-control info-${ result.data[i]._id }" name="area"
																id="area-${ result.data[i]._id }"
																data-class="user_info" type="text" disabled/>
														</div><div class="my-1 col-md-6 col-12">
															<p class="text-mini-label text-center m-0">
																${ Array('Dirección / Subdirección', 'Direction / Sub-direction')[lang] }
															</p>
															<input value="${ ((result.data[i].direction).length)
																? (('description' in result.data[i].direction[lang])
																	? result.data[i].direction[lang].description
																	: 'N.A')
																: 'N.A' }"
																class="form-control info-${ result.data[i]._id }" name="direction"
																id="direction-${ result.data[i]._id }"
																data-class="user_info" type="text" disabled/>
														</div><div class="my-1 col-md-6 col-12">
															<p class="text-mini-label text-center m-0">
																${ Array('Categoría', 'Category')[lang] }
															</p>
															<input value="${ ((result.data[i].category).length)
																? (('description' in result.data[i].category[lang])
																	? result.data[i].category[lang].description
																	: 'N.A')
																: 'N.A' }"
																class="form-control info-${ result.data[i]._id }" name="category"
																id="category-${ result.data[i]._id }"
																data-class="user_info" type="text" disabled/>
														</div>
														<div class="my-1 col-md-6 col-12">
															<p class="text-mini-label text-center m-0">
																${ Array('Puesto', 'Position')[lang] }
															</p>
															<input value="${
																((result.data[i].position).length) ? (
																( 'description' in result.data[i].position[lang])
																	? result.data[i].position[lang].description
																	: 'N.A.' )
																: 'N.A' }"
																class="form-control info-${ result.data[i]._id }" name="position"
																id="position-${ result.data[i]._id }"
																data-class="user_info" type="text" disabled/>
													</div></div>
													<div class="row">
														<div class="my-1 col-md-5 col-6 mx-auto">
															<p class="text-mini-label text-center m-0">
																${ Array('ID Jefe directo', 'ID manager')[lang] }
															</p>
															<input value="${ result.data[i].manager }" class="form-control info-${result.data[i]._id }
																${ (parseInt(result.data[i].category) <= 1) ? '' : 'read-only' }"
																name="manager" id="manager-${ result.data[i]._id }" data-class="user_info"
																type="text" disabled/>
												</div></div></div>
												${ ('user_' in result.data[i]) 
													? `<div class="my-md-2 my-1 px-md-3 py-md-2 p-2 rounded-3">
														<div class="row">
															<div class="col-12">
																<h6 class="p-0 text-black-50 fs-5">
																	${ Array('Información de solo lectura', 'Read-Only information')[lang] }
																</h6>
															</div>

															<div class="my-1 col-md-6 col-12 mx-auto">
																<p class="text-mini-label text-center m-0">
																	${ Array('Creado', 'Created')[lang] }
																</p>
																<input value="${ result.data[i].user_.created.date } @ ${ result.data[i].user_.created.time }"
																	class="form-control info-${ result.data[i]._id } date read-only text-center"
																	name="created" id="created-${ result.data[i]._id }" type="text" disabled/>
															</div>
															<div class="my-1 col-md-6 col-12 mx-auto">
																<p class="text-mini-label text-center m-0">
																	${ Array('Ultimo inicio de sesión', 'Last login')[lang] }
																</p>
																<input value="${ result.data[i].user_.last_conn.date } @ ${ result.data[i].user_.last_conn.time }"
																	class="form-control info-${ result.data[i]._id } date read-only text-center"
																	name="lastConn" id="lastConn-${ result.data[i]._id }" type="text" disabled/>
													</div></div></div>` : ''
												}
												<div class="accordion accordion-flush mt-2" id="inner-accordions-${ result.data[i]._id }">
													${ ('eval_' in result.data[i])
														? `<!-- Evaluation information -->
														<div class="accordion-item">
															<h2 class="accordion-header" id="flush-eval-${ result.data[i]._id }">
																<button class="btn-outline-success accordion-button collapsed"
																	type="button" data-bs-toggle="collapse" data-bs-target="#flush-eval-collapse-${ result.data[i]._id }"
																	aria-expanded="false" aria-controls="flush-eval-collapse-${ result.data[i]._id }">
																	${ Array('Evaluaciones', 'Evaluations')[lang] }

																</button>
															</h2>
															<div id="flush-eval-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
																aria-labelledby="flush-eval-${ result.data[i]._id }" data-bs-parent="#inner-accordions-${ result.data[i]._id }">
																<div class="accordion-body px-0">
																	<div class="row">
																		${ evalRecords }
														</div></div></div></div>` : ''
													}
													<!-- Sensitive information -->
													<div class="accordion-item">
														<h2 class="accordion-header" id="flush-sensitive-${ result.data[i]._id }">
															<button class="btn-outline-warning accordion-button collapsed" type="button" data-bs-toggle="collapse"
																data-bs-target="#flush-sensitive-collapse-${ result.data[i]._id }" aria-expanded="false"
																aria-controls="flush-sensitive-collapse-${ result.data[i]._id }">
																${ Array('Información sensible', 'Sensitive information')[lang] }
															</button>
														</h2>
														<div id="flush-sensitive-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
															aria-labelledby="flush-sensitive-${ result.data[i]._id }" data-bs-parent="#inner-accordions-${ result.data[i]._id }">
															<div class="accordion-body px-0">
																<div class="row">
																	<div class="my-1 col-md-9 col-12 mx-auto">
																		<p class="text-mini-label text-center m-0">
																			${ Array('Nombre', 'Name')[lang] }
																		</p>
																		<input value="${ result.data[i].name }" class="form-control info-${ result.data[i]._id }"
																			name="name" id="first-name-${ result.data[i]._id }" data-class="user_info" type="text" disabled>
													</div></div></div></div></div>
													<!-- Danger Zone -->
													<div class="accordion accordion-flush mt-2" id="user-accordion-inner-${ result.data[i]._id }">
														<div class="accordion-item">
															<h2 class="accordion-header" id="danger-flush-${ result.data[i]._id }">
																<button class="btn-outline-danger accordion-button collapsed" type="button" data-bs-toggle="collapse"
																	data-bs-target="#danger-flush-collapse-${ result.data[i]._id }" aria-expanded="false"
																	aria-controls="danger-flush-collapse-${ result.data[i]._id }">
																	${ Array('Zona de peligro', 'Danger zone')[lang] }
																</button>
															</h2>
															<div id="danger-flush-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
																aria-labelledby="danger-flush-${ result.data[i]._id }" data-bs-parent="#inner-accordions-${ result.data[i]._id }">
																<div class="accordion-body px-0">
																	<div class="row">
																		<div class="my-1 col-md-3 col-12 mx-auto">
																			<p class="text-mini-label text-center m-0">
																				${ Array('Habilitado', 'Enabled')[lang] }
																			</p>
																			<div class="container ps-3">
																				<div class="button b2 mt-2 mb-2" id="button-17">
																					<input name="disabled" id="disabled-${ result.data[i]._id }" type="checkbox"
																						data-class="user_all" class="checkbox info-${ result.data[i]._id }"
																							${('enabled' in result.data[i]) ? '' : 'checked' } disabled>
																						<div class="knobs" data-unchecked="${ Array('Sí', 'Yes')[lang] }"
																							data-checked="${ Array('No', 'No')[lang] }"><span></span></div>
																					<div class="layer"></div>
																				</div>
																			</div>
																		</div>
																		${ ('user_' in result.data[i])
																			? `<div class="my-1 col-md-5 col-12 mx-auto">
																				<p class="text-mini-label text-center m-0">
																					${ Array('Contraseña', 'Password')[lang] }
																				</p>
																				<input value="amogus_sussy_bak😈📸" class="form-control info-${ result.data[i]._id } mt-2"
																					name="pass" id="pass-${ result.data[i]._id }" data-class="user" type="password"
																					autocomplete="new-password" disabled>
																			</div>` : ''
																		}
												</div></div></div></div></div></div>
												<div class="w-100 text-right d-flex justify-content-end mt-2 pe-3">
													<button id="edit-info-${ result.data[i]._id }" data-id="info-${ result.data[i]._id }"
														data-table="1" class="btn-edit btn btn-secondary px-3 py-2">
														<i class="pe-none pe-1 fa-solid fa-pen-to-square"></i>
														<span class="pe-none">${ Array('Editar', 'Edit')[lang] }</span>
													</button>
													<button id="cancel-info-${ result.data[i]._id }" data-id="info-${ result.data[i]._id }"
														data-table="1" class="btn-cancel btn btn-outline-danger px-3 py-2 me-2 d-none" disabled>
														<i class="pe-none pe-1 fa-solid fa-ban"></i>
														<span class="pe-none">${ Array('Cancelar', 'Cancel')[lang] }</span>
													</button>
													<button id="save-info-${ result.data[i]._id }" data-id="info-${ result.data[i]._id }"
														data-table="1" class="btn-save btn btn-outline-dark px-3 py-2 d-none" disabled>
														<i class="pe-none pe-1 fa-solid fa-floppy-disk"></i>
														<span class="pe-none">${ Array('Guardar', 'Save')[lang] }</span>
									</button></div></div></div></div>`
								)
							}
						} else {
							for(let i in result.data) {
								$e('#collector-accordion').insertAdjacentHTML(
									'afterbegin',
									`<div class="accordion-item">
										<h2 class="accordion-header" id="flush-head-collector-${ result.data[i]['_id'] }">
											<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
												data-bs-target="#flush-collector-${ result.data[i]['_id'] }" aria-expanded="false"
												aria-controls="flush-collector-${ result.data[i]['_id'] }">
												<div class="item-header d-flex w-100">
													<div class="text-center p-0 col-2 d-flex">
														<p class="m-0">ID: ${ result.data[i]['_id'] }</p>
													</div>
													<div class="text-right p-0 ms-auto me-2">
														<p class="m-0 lang" data-lang="es">${
															(result.data[i]['description'][lang])
															? result.data[i]['description'][lang]
															: result.data[i]['description'][0]
														}</p>
										</div></div></button></h2>

										<div id="flush-collector-${ result.data[i]['_id'] }" class="accordion-collapse collapse"
											aria-labelledby="flush-head-collector-${ result.data[i]['_id'] }" data-bs-parent="#collector-accordion">
											<div class="accordion-body px-3">
												<div class="row">
													<div class="my-1 col-md-6 col-12 mx-auto">
														<p class="text-mini-label text-center m-0">
															${ (lang == 0) ? 'Idioma (es)' : 'Language (es)' }
														</p>
														<input value="${ result.data[i]['description'][0] }" class="form-control e-${ result.data[i]['_id'] }"
															name="0" id="exts-e-${ result.data[i]['_id'] }" type="text" disabled>
													</div><div class="my-1 col-md-6 col-12 mx-auto">
														<p class="text-mini-label text-center m-0">
														${ (lang == 0) ? 'Idioma (en)' : 'Language (en)' }
														</p>
														<input value="${ (result.data[i]['description'][1]) ? result.data[i]['description'][1] : '' }"
															name="1" class="form-control e-${ result.data[i]['_id'] }" id="extn-e-${ result.data[i]['_id'] }"
															type="text" disabled>
												</div></div>
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
									</button></div></div></div></div>`
								)
							}
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
						$e('#collector-accordion').insertAdjacentHTML(
							'afterbegin',
							`<td id="empty" colspan="5" class="border-0 text-center">
								<div class="text-center">
									<i class="fa-solid fa-ghost icon-ghost f-vScreen-15 my-3 text-black-15"></i>
									<p class="my-2 text-ghost fs-4">${
										Array('No hay datos para mostrar', 'No records to show')[lang]
									}</p>
							</div></td>`
						)
					}
				} else showSnack(result.error, null, SNACK.error)
			},
			(error) => console.error(error)
		)
	} else {
		$e('#collector').classList.add('d-none')
		$e('#personnel-table').classList.remove('d-none')

		$e('#tables-opts .dropdown-item:disabled').disabled = false
		$e('#tables-opts .dropdown-item:first-child').disabled = true
	}
}