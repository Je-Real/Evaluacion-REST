let firstName, lastName,
	area, direction, position,
	a_ = null, d_ = 0, p_ = 0,
	lvl_s = 0,
	pkg = { data: [] }, options = []

window.addEventListener('load', async(e) => {
	lockRegister(true)
	eventAssigner('#submit-register', 'click', register)

	eventAssigner('#register-personnel, .to-register', 'click', () => { lockRegister(false); lockFile(true) })
	eventAssigner('*[aria-label="Close"]:not(.to-register)', 'click', () => { lockRegister(true); lockFile(false) })

	eventAssigner('#as_user', 'change', (e) => {
		if(e.target.checked) {
			$e('#register input[type="password"]').disabled = false
			$e('#register input[type="password"]').classList.add('mandatory')
		} else {
			$e('#register input[type="password"]').disabled = true
			$e('#register input[type="password"]').classList.remove('mandatory')
		}
	})
	eventAssigner('#force', 'change', (e) => {
		if(e.target.checked) {
			$e('#new_id.read-only').disabled = false
			$e('#new_id.read-only').classList.remove('read-only')
		} else {
			$e('#new_id').disabled = true
			$e('#new_id').classList.add('read-only')
		}
	})

	eventAssigner('#excel-file', 'change', e => {readUrl(e.target)})
	eventAssigner('#submit-file', 'click', e => {
		pkg['file'] = null
		pkg['fields'] = {}

		$a('#register-file select').forEach(node => {
			let value = node[node.selectedIndex].value
			pkg['file'] = true

			if(node.classList.contains('mandatory')) {
				if(value === '0') {
					pkg['file'] = false
					return showSnack(
						(lang == 0) ? 'Algún campo obligatorio debe esta incompleto. Por favor, revisa el formulario'
									: 'Some required fields must be incomplete. Please check the form',
						null, SNACK.warning
					)
				}
			}
			pkg.fields[node.name] = value
		})
		

		if(pkg['file']) {
			fetchTo(
				'http://localhost:999/session/sign-in',
				'POST',
				pkg,
				(result) => {
					if(result.status === 200) {
						showSnack(result.msg[lang], null, SNACK.success)
						setTimeout(() => {
							window.location.reload()
						}, 2000)
					}
					else showSnack(result.msg[lang], null, SNACK.warning)
				},
				(error) => {
					showSnack('Error '+error, null, SNACK.error)
					console.error(error)
				}
			)
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
			if (extension == '.XLS' || extension == '.XLSX') {
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
						null, SNACK.error
					)
				})
			}
			else
				return showSnack(
					(lang == 0) ?'Por favor, selecciona un archivo de excel valido'
					:'Please select a valid excel file',
					null, SNACK.error
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
		let reader = new FileReader()

		reader.readAsBinaryString(file)
		reader.onload = async function(e) {
			let data = e.target.result,
				workbook = await XLSX.read(data, { type : 'binary' })
				
			workbook.SheetNames.forEach((sheetName, i) => {
				if(i === 0) {
					let roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])
					if (roa.length > 0) {
						pkg['data'] = roa
						
						for(let j in roa[0]) {
							$a('#register-file select').forEach(node => {
								node.insertAdjacentHTML('beforeend', `<option value="${j}">${j}</option>`)
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
	pkg['data'] = [{
		_id: 		$e('#new_id:not(.read-only):not(disabled)').value,
		name: 		($e('#name:not(disabled)').value).trim(),
		area: 		parseInt($e('#area:not(disabled)')[$e('#area').selectedIndex].value) + 1,
		direction: 	parseInt($e('#direction:not(disabled)')[$e('#direction').selectedIndex].value) + 1,
		position: 	parseInt($e('#position:not(disabled)')[$e('#position').selectedIndex].value) + 1,
		category: 	parseInt($e('#category:not(disabled)')[$e('#category').selectedIndex].value) + 1
	}]

	if($e('#as_user:not(disabled)').checked) {
		//pkg.data[0]['pass'] = $e('#new_pass:not(disabled)').value //random password in back-end
		pkg.data[0]['as_user'] = $e('#as_user:not(disabled)').checked
	}

	for(let i in pkg.data[0]) {
		if(pkg.data[0][i] == undefined || pkg.data[0][i] == '' || pkg.data[0][i] === 0)
			return showSnack(
				(lang == 0) ? `No se puede enviar el registro, hay campos vacíos.`
							: `Unable to send the data, there is empty fields`,
				null, SNACK.warning
			)
	}

	await fetchTo(
		'http://localhost:999/session/sign-in',
		'POST',
		pkg,
		(result) => {
			if(result.status === 200) {
				showSnack(result.msg[lang], null, SNACK.success)
				setTimeout(() => {
					window.location.reload()
				}, 2000)
			}
			else showSnack(result.msg[lang], null, SNACK.warning)
		},
		(error) => {
			showSnack('Error '+error, null, SNACK.error)
			console.error(error)
		}
	)
}

function getManager(lvl_sel) {
	$a('.mgr-s').forEach(node => node.remove())
	if(lvl_sel === false) {
		$e('#manager').disabled = true
		$e('#mgr-s').className.remove('d-none')
		$e('#mgr-s').selected = true
		$e('#lvl-s').selected = true
		return
	}

	let pkg = {
		area: $e('#area')[$e('#area').selectedIndex].value,
		department: $e('#department')[$e('#department').selectedIndex].value,
		career: $e('#career')[$e('#career').selectedIndex].value,
		level: parseInt(lvl_sel)
	}

	fetchTo(
		'http://localhost:999/register/manager',
		'GET',
		pkg,
		(result) => {
			if(result.status === 200) {
				if(result.data.length > 0) {

					for(info in result.data) {
						$e('#manager').insertAdjacentHTML('beforeend',
							`<option class='mgr-s mgr-${info}' value='${info+1}'>
							${(result.data[info].name).split(' ')[0]}
							</option>`
						)
					}
					$e('#mgr-s').classList.add('d-none')
					$a('.mgr-s.mgr-0').forEach(node => node.selected = true)

					$e('#manager').disabled = false
				} else {
					$e('#manager').disabled = true
					$e('#mgr-s').innerHTML = 'N/A'
					$e('#mgr-s').classList.remove('d-none')
					$e('#mgr-s').selected = true
					showSnack(
						(lang == 0) ? 'No se encontró manager. <br/>Error del servidor.'
									: 'No manager found. <br/> Server error.',
						null, SNACK.error
					)
				}
			}
		},
		(error, result) => {
			showSnack(
				'Status: '+result+'. '+error,
				null, SNACK.error
			)
			console.error(error)
		}
	)
}