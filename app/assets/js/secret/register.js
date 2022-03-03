let firstName, lastName,
	area, direction, position,
	a_ = null, d_ = 0, p_ = 0,
	lvl_s = 0

window.addEventListener('load', async(e) => {
	eventAssigner('#submit-register', 'click', register)
})

function readUrl(input) {
	if (input.files && input.files[0]) {
		let reader = new FileReader()
		reader.onload = (e) => {
			let fileData = e.target.result
			let fileName = input.files[0].name
			input.setAttribute("data-title", fileName)
		}
		reader.readAsDataURL(input.files[0]);
	}
}

const register = async() => {
	let pkg = { 
		_id: $e('#new_id').value,
		pass: $e('#new_pass').value,
		first_name: ($e('#first_name').value).trim(),
		last_name: ($e('#last_name').value).trim(),
		area: $e('#area')[$e('#area').selectedIndex].value,
		direction: $e('#direction')[$e('#direction').selectedIndex].value,
		position: $e('#position')[$e('#position').selectedIndex].value,
	}

	await fetchTo(
		'http://localhost:999/session/sign-in',
		'POST',
		pkg,
		(result) => {
			showSnack(result.msg, null, SNACK.success)
			if(result.status === 200) $e('#f-reg').reset()
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
							${(result.data[info].first_name).split(' ')[0]} 
							${(result.data[info].last_name)}
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