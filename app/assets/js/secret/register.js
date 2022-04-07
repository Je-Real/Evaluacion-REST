let firstName, lastName,
	area, directorate, position,
	a_ = null, d_ = 0, p_ = 0,
	lvl_s = 0,
	pkg = { data: [] }, options = []

window.addEventListener('load', async(e) => {
	lockRegister(true)
	eventAssigner('#submit-register', 'click', e => {register()})

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
	
	eventAssigner('#excel-file', 'change', e => {readUrl(e.target)}) // Read the name and columns of the file
	eventAssigner('#submit-file', 'click', e => {register(true)})

	eventAssigner('button[aria-label="Close"]:not(#close-add-record)', 'click', () => {
		$e('#manual-reg').reset()
		$e('#file-reg').reset()
	})

	eventAssigner('#close-add-record', 'click', () => {
		$a('#add-records-modal input.form-control').forEach(node => {
			node.value = ''
		})
		$e('#collection-selector')[0].selected = true
	})

	eventAssigner('#add-records', 'click', (e) => {
		let passRecords = true,
			collectionSlc = $e('#collection-selector').value,
			description = []
		
		if(parseInt(collectionSlc) == 0) 
			return showSnack(
				Array('No se ha seleccionado una colección / tabla. Seleccione una por favor',
				'A collection / table has not been selected. Please select one.')[lang],
				null, 'warning'
			)
		
		$a('#add-records-modal input.form-control').forEach(node => {
			let valTrimmed = node.value.trim()
			if(valTrimmed.length < 1 && passRecords) {
				showSnack(
					Array('Un campo se encuentra vació. Por favor, llénalo antes de enviar los datos.',
					'One field is empty. Please fill it before sending the data.')[lang],
					null, 'warning'
				)
				return passRecords = false
			}
			description.push(valTrimmed)
		})

		if(passRecords) {
			spinner('wait', true)
			fetchTo(
				window.location.origin+'/admin-control/add-record-to',
				'POST',
				{ description: description, collection: collectionSlc },
				async(result) => {
					if(result.snack)
						showSnack(result.msg, null, result.snackType)

					if(result.status === 200) {
						$a('#add-records input.form-control').forEach(node => {
							node.value = ''
						})

						$e(`#register select[name="${collectionSlc}"]`).insertAdjacentHTML(
							'beforeend',
							`<option value="${result.data._id}">${result.data.description[lang]}</option>`
						)
					}
				},
				async(error) => console.error(error)
			)
			.finally(() => {
				$a('#add-records-modal input.form-control').forEach(node => {
					node.value = ''
				})
				$e('#collection-selector')[0].selected = true
				$e('#reload-list').click()
				spinner('wait', false)
			})
		}
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

const register = async(fileMode = false) => {
	if(fileMode) {
		pkg['file'] = true
		pkg['fields'] = {}

		$a('#register-file select').forEach(async(node) => {
			let value = node.value

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

				pkg['data'] = [{}]
			})
		}
	} else {
		pkg['data'] = [{}]

		if($e('#new_user:not(disabled)').checked) {
			pkg.data[0]['new_user'] = $e('#new_user:not(disabled)').checked
		} else if($e('#find_user:not(disabled)').checked) {
			pkg.data[0]['find_user'] = $e('#find_user:not(disabled)').checked
		}

		let passReg = true
		$a('#manual-reg .form-control.mandatory').forEach(node => {
			if(node.tagName.toLowerCase() == 'input') {
				if(node.value.lenght < 4 && passReg) {
					passReg = false
					return showSnack(
						(lang == 0) ? `No se puede enviar el registro, hay campos vacíos.`
									: `Unable to send the data, there is empty fields`,
						null, 'warning'
					)
				}
				
				if(node.classList.contains('dynamic-hint')) {
					if('id' in node.dataset)
						pkg.data[0][node.name] = node.dataset.id
					else if('name' in node.dataset)
						pkg.data[0][node.name] = node.dataset.name
					else
						pkg.data[0][node.name] = node.value
				} else pkg.data[0][node.name] = node.value
			} else if(node.tagName.toLowerCase() == 'select') {
				if(parseInt(node.selectedIndex) == 0 && passReg) {
					passReg = false
					return showSnack(
						(lang == 0) ? `No se puede enviar el registro, hay campos vacíos.`
									: `Unable to send the data, there is empty fields`,
						null, 'warning'
					)
				} else pkg.data[0][node.name] = parseInt(node[node.selectedIndex].value)
			} else {
				passReg = false
				return console.warn(node)
			}
		})

		if(passReg) {
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
				} else showSnack(data.headers.get('msg').split('|'), null, 'error')
			})
			.catch(error => console.error(error))
			.finally(() => {
				$e('#register button.close-modal').click()
				$e('#reload-list').click()
				spinner('wait', false)

				pkg['data'] = [{}]
			})
		}
	}
}