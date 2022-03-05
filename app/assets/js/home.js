window.addEventListener('load', async(e) => {
	const login = () => {
		let u = $e('#txt-code'),
			p = $e('#txt-pass')
	
		if(!p.value || !u.value)
			showSnack(
				(lang == 0) ? 'Revisa los campos de inicio de sesión, por favor'
							: 'Check the session fields, please',
				null, SNACK.error
			)
		else
			fetchTo(
				'http://localhost:999/session/log-in',
				'POST',
				{ _id: u.value, pass: p.value },
				async(result) => {
					if(result.msg)
						showSnack(result.msg, null, SNACK.info )

					if(result.status === 200) {
						$e('#load-b').classList.remove('hidden', 'fade')
						if(result.data !== null) {
							await setCookie('user', JSON.stringify(result.data))
							.then(() => go('home/'))
							.catch(() => {
								showSnack(
									(lang == 0) ? 'Falla de Cookies' : 'Cookies failure',
									null, SNACK.warning
								)
							})
						}
						else return go('home/')
					}

					if('class' in result) {
						$a('input').forEach(node => {
							node.classList.add('invalid')
						})
						$e('#txt-pass').value = ''
					}
				},
				async(error) => console.error(error)
			)
	}
	
	const enterTheLogin = (e) => {
		let code = e.key || e.code
		if(code === 'Enter') login()
	}

	window.addEventListener('keypress', (e) => { enterTheLogin(e) })

	setTimeout(async() => {
		$e('#floatingLogin').classList.replace('hide', 'show')
	}, 200)

	eventAssigner('input', 'keypress', (e) => {
		if(e.target.classList.contains('invalid'))
			e.target.classList.remove('invalid')
	})

	eventAssigner('#btn-login', 'click', login)
})