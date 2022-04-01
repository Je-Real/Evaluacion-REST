let firstName, lastName,
	area, directorate, position,
	a_ = null, d_ = 0, p_ = 0,
	lvl_s = 0,
	pkg = { data: [] }, options = []

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

							eventAssigner('.hints', 'click', (e) => { // TODO: Fix this (get automatically? the value)
								let input = e.target.parentElement.parentElement.querySelector('input')

								if('hint' in input.dataset)
									input.value = e.target.dataset['id']
								else {
									$e('#new_id').value = e.target.dataset['id']
									$e('#name').value = e.target.dataset['name']
								}
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

window.addEventListener('load', async(e) => {
	lockRegister(true)
	eventAssigner('#submit-register', 'click', register)

	eventAssigner('#register-personnel, .to-register', 'click', () => { lockRegister(false); lockFile(true) })
	eventAssigner('*[aria-label="Close"]:not(.to-register)', 'click', () => { lockRegister(true); lockFile(false) })

	eventAssigner('#find_user, #new_user', 'change', (e) => {
		let tgt = e.target
		const all_mode = () => {
			$e('#find_user').checked = false
			$a('.reg-field:not(.find-user)').forEach(node => {
				node.classList.remove('d-none')
			})
			$a('.form-control:not(.find-user)').forEach(node => {
				node.classList.add('mandatory')
			})
		}
		const find_mode = () => {
			$e('#new_user').checked = false
			$a('.reg-field:not(.find-user)').forEach(node => {
				node.classList.add('d-none')
			})
			$a('.form-control:not(.find-user)').forEach(node => {
				node.classList.remove('mandatory')
				if(node.tagName.toLowerCase == 'input')
					node.value = ''
				else
					node.selectedIndex = 0
			})
		}

		if(tgt.id === 'find_user') {
			if(tgt.checked) find_mode()
			else all_mode()
		} else if (tgt.id === 'new_user') {
			if(tgt.checked) all_mode()
		}
	})

	$a('.dynamic-hint').forEach(node => {
		node.parentElement.insertAdjacentHTML(
			'beforeend',
			'<div class="modal-hint hide mt-1 bg-light rounded-3 shadow-lg"></div>'
		)
	})
	eventAssigner('.dynamic-hint', 'focusin', e => modalHintDisplay(e, true))
	eventAssigner('.dynamic-hint', 'focusout', e => modalHintDisplay(e, false))
	eventAssigner('.dynamic-hint', 'keydown', e => dynamicHints(e, 'user_info'))
	eventAssigner('.dynamic-hint', 'change', e => dynamicHints(e, 'user_info'))
	
	eventAssigner('#excel-file', 'change', e => {readUrl(e.target)}) // Read the name and columns of the file
	eventAssigner('#submit-file', 'click', async e => { // Send file event
		pkg['file'] = true
		pkg['fields'] = {}

		$a('#register-file select').forEach(async(node) => {
			let value = node[node.selectedIndex].value

			if(node.classList.contains('mandatory')) {
				if(value === '0') {
					if(pkg['file'] == true) {
						showSnack(
							(lang == 0) ? 'Algún campo obligatorio debe esta incompleto. Por favor, revisa el formulario'
							: 'Some required fields must be incomplete. Please check the form',
							null, 'warning'
						)
						return pkg['file'] = false
					}
				}
			}
			
			pkg.fields[node.name] = value
		})

		if(pkg['file']) {
			spinner('wait', true)

			await fetch(window.location.origin+'/session/sign-in',
				{method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(pkg)}
			)
			.then(async data => {
				if(data.status != 401) {
					let SNK_Type = '',
						filename = data.headers.get('filename')

					if(data.status === 200) SNK_Type = 'success'
					else SNK_Type = 'warning'
					if(Boolean(data.headers.get('snack')) == true) {
						showSnack(data.headers.get('msg'), null, SNK_Type)
					}
	
					await data.arrayBuffer()
					.then(async(data) => {
						if(data == null || data == undefined)
							return showSnack('Server error', null, 'error')
						const blob = new Blob([data]) // Create a Blob object
						const url = URL.createObjectURL(blob) // Create an object URL
						download(url, filename) // Download file
						URL.revokeObjectURL(url) // Release the object URL
					})
				} else showSnack(data.headers.get('msg'), null, 'error')
			})
			.catch(error => console.error(error))
			.finally(async() => {
				$e('#register-file button.close-modal').click()
				$e('#reload-list').click()
				spinner('wait', false)
			})
		}
	})

	eventAssigner('button[aria-label="Close"]', 'click', () => {
		$e('#manual-reg').reset()
		$e('#file-reg').reset()
	})
})

const lockRegister = (lock = true) => {
	if(lock) {
		$a('#register input, #register select, #submit-register').forEach(node => {
			node.disabled = true
		})
		$e('#register input:not([type="checkbox"])').checked = false
	}
	else
		$a('#register input:not(.read-only):not([type="password"]), #register select, #submit-register').forEach(node => {
			node.disabled = false
		})
}

const lockFile = (lock = true) => {
	if(lock) {
		$e('input[type="file"]').setAttribute(
			'data-title',
			(lang == 0) ? 'Haz clic aquí o arrastra y suelta el archivo'
						: 'Click here or drag and drop a file'
		)
		$e('#submit-file').disabled = true
		$e('#columns').classList.add('d-none')
		$a('#register-file select').forEach(node => {
			node.disabled = true
		})
		$e('input[type="file"]').files = null
	} else {
		$a('#register-file select').forEach(node => {
			node.disabled = false
		})
	}
}

const readUrl = (input) => {
	if(input.files && input.files[0]) {
		let reader = new FileReader()
		
		reader.onload = async(e) => {
			let files = input.files,
				filename = files[0].name

			extension = filename.substring(filename.lastIndexOf('.')).toUpperCase()
			if(extension == '.XLS' || extension == '.XLSX') {
				excelToJSON(files[0])
				.then((result) => {
					if(result) {
						input.setAttribute('data-title', filename)
						$e('#columns').classList.remove('d-none')
					}
				})
				.catch((error) => {
					console.log(error)
					return showSnack(
						(lang == 0) ?'Error en la lectura del archivo de excel. Revise la consola, por favor'
						:'Error reading excel file. Please check the console',
						null, 'error'
					)
				})
			}
			else return showSnack(
				(lang == 0) ?'Por favor, selecciona un archivo de excel valido'
				:'Please select a valid excel file',
				null, 'error'
			)
		}
		reader.onerror = (e) => { console.error(e) }
		reader.readAsDataURL(input.files[0])

		$e('#submit-file').disabled = false
	}
}

//Method to read excel file and convert it into JSON
const excelToJSON = async(file) => {
	try {
		$a('#register-file select option').forEach(node => {
			node.remove()
		})
		$a('#register-file select').forEach(node => {
			node.innerHTML = Array(
				`<option value="0" selected>- Selecciona una columna -</option>`,
				`<option value="0" selected>- Select a column -</option>`)[lang]
		})

		let reader = new FileReader()

		reader.readAsBinaryString(file)
		reader.onload = async function(e) {
			let data = e.target.result,
				workbook = await XLSX.read(data, { type : 'binary' })
				
			workbook.SheetNames.forEach((sheetName, i) => {
				if(i === 0) {
					let roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]),
						ref = workbook.Sheets[sheetName]['!ref'],
						firstCol = ref.split(':')[0].charCodeAt(0),
						lastCol = ref.split(':')[1].charCodeAt(0)

					if(roa.length > 0) {
						pkg['data'] = roa
						
						for(let j = firstCol; j <= lastCol; j++) {
							let header = String(workbook.Sheets[sheetName][String.fromCharCode(j)+'1'].v)
							$a('#register-file select').forEach(node => {
								node.insertAdjacentHTML('beforeend', `<option value="${header}">${header.trim()}</option>`)
							})
						}
					}
				}
			})
		}
	}
	catch(e) {
		throw e
	}
	finally {
		return true
	}
}

const register = async() => {
	pkg['data'] = [{}]

	if($e('#new_user:not(disabled)').checked) {
		pkg.data[0]['new_user'] = $e('#new_user:not(disabled)').checked
	} else if($e('#find_user:not(disabled)').checked) {
		pkg.data[0]['find_user'] = $e('#find_user:not(disabled)').checked
	}

	let pass = true
	$a('#manual-reg .form-control.mandatory').forEach(node => {
		if(node.tagName.toLowerCase() == 'input') {
			if(node.value.lenght < 4 && pass) {
				pass = false
				return showSnack(
					(lang == 0) ? `No se puede enviar el registro, hay campos vacíos.`
								: `Unable to send the data, there is empty fields`,
					null, 'warning'
				)
			} else pkg.data[0][node.name] = node.value
		}
		else if(node.tagName.toLowerCase() == 'select') {
			if(parseInt(node.selectedIndex) == 0 && pass) {
				pass = false
				return showSnack(
					(lang == 0) ? `No se puede enviar el registro, hay campos vacíos.`
								: `Unable to send the data, there is empty fields`,
					null, 'warning'
				)
			} else pkg.data[0][node.name] = parseInt(node[node.selectedIndex].value)
		} else {
			pass = false
			return console.warn(node)
		}
	})

	if(pass) {
		spinner('wait', true)

		await fetch(window.location.origin+'/session/sign-in',
			{method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(pkg)}
		)
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
		.catch(error => console.error(error))
		.finally(() => {
			$e('#register button.close-modal').click()
			$e('#reload-list').click()
			spinner('wait', false)
		})
	}
}