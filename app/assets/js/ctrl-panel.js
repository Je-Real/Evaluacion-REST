let idTarget

const evaluateUser = (e) => {
	upperAttrIterator(e.target, 'id')
	.then(res => {
		if(res != null) {
			setCookie('USelected', res)
			go('evaluation/')
		}
	})
	.catch(error => console.log(error))
}

const deleteEvalUser = async(e) => {
	idTarget = await upperAttrIterator(e.target, 'id')
		.catch(error => console.log(error))
	$e('#delete-eval-modal #message-user').innerHTML = e.target.parentElement.parentElement.querySelector('.name').innerHTML.trim()
}

const confirmDeleteEval = async(e) => {
	manageEvalUser({target: {id: idTarget, value: 'delete'}}, false)
}

const manageEvalUser = async(e, auto = true) => {
	let id = null
	
	if(auto) id = await upperAttrIterator(e.target, 'id')
		.catch(error => console.log(error))
	else id = e.target.id

	if(id != null) {
		fetchTo(
			window.location.origin+'/home/manage-user/'+id+'/'+e.target.value,
			'GET',
			null,
			async (result) => {
				if(result.snack) showSnack(result.msg, null, 'info')
				if(result.status === 200) {
					if(!auto) $e('#delete-eval-modal .close-modal').click()
					window.location.reload(true)
				}
			},
			(error) => {
				showSnack(
					(lang == 0) ? 'Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte'
								: 'Please open the browser console, copy the error and contact a support specialist.',
					null,
					'error'
				)
				console.error(error)
			}
		)
	}
}

const pdfFormatEval = (e) => {
	upperAttrIterator(e.target, 'id')
	.then(id => {
		if(id != null) {
			fetch(window.location.origin+'/home/evaluation-pdf/'+id)
			.then(async data => {
				if(data.status != 401) {
					let SNK_Type = '',
						filename = data.headers.get('filename')
	
					if(data.status === 200) SNK_Type = 'success'
					else SNK_Type = 'warning'
					if(Boolean(data.headers.get('snack')) == true)
						showSnack(data.headers.get('msg'), null, SNK_Type)
					if(data.headers.get('error') != undefined)
						showSnack(data.headers.get('error'), null, SNK_Type)
	
					await data.arrayBuffer()
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
				showSnack(
					(lang == 0) ? 'Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte'
								: 'Please open the browser console, copy the error and contact a support specialist.',
					null,
					'error'
				)
				console.error(error)
			})
		} else
			showSnack(
				(lang == 0) ? 'Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte'
							: 'Please open the browser console, copy the error and contact a support specialist.',
				null,
				'error'
			)
	})
	.catch(error => console.log(error))
}

window.addEventListener('load', async(e) => {
	eventAssigner('.evaluate', 'click', evaluateUser).catch((error) => console.error(error))
	eventAssigner('.manage-eval', 'click', manageEvalUser).catch((error) => console.error(error))
	eventAssigner('.generate-pdf', 'click', pdfFormatEval).catch((error) => console.error(error))
	eventAssigner('.delete-eval', 'click', deleteEvalUser).catch((error) => console.error(error))
	eventAssigner('#confirm-delete', 'click', confirmDeleteEval).catch((error) => console.error(error))
	//eventAssigner('#registerPersonnel', 'click', () => go('register/')).catch((error) => console.warn(error))
})

