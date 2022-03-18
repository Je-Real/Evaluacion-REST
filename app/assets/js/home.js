window.addEventListener('load', async(e) => {
	const login = () => {
		let u = $e('#txt-code'),
			p = $e('#txt-pass'),
			btn = $e('#btn-login'),
			loginBox = $e('.login-box')
	
		if(!p.value || !u.value)
			showSnack(Array(
				'Revisa los campos de inicio de sesión, por favor', 
				'Check the session fields, please')[lang],
				null, 'error'
			)
		else{
			btn.disabled = true
			loginBox.classList.add('waiting')

			fetchTo(
				'http://localhost:999/session/log-in',
				'POST',
				{ _id: u.value, pass: p.value },
				async(result) => {
					if(result.msg)
						showSnack(result.msg, null, 'info' )

					if(result.status === 200) {
						spinner('load', true)
						.then(async res => {
							if(res) {
								if(result.data !== null) {
									await setCookie('user', JSON.stringify(result.data))
									.then(() => go('home/'))
									.catch(error => {
										console.error(error)
										showSnack(Array(
											'Falla al guardar las cookies',
											'Failure while saving cookies')[lang],
											null, 'warning'
										)
									})
								}
								else return go('home/')
							}
						})
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
			.finally(() => {
				loginBox.classList.replace('waiting', 'stop')
				btn.disabled = false
				setTimeout(() => {
					loginBox.classList.remove('stop')
				}, 1050);
			})
		}
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