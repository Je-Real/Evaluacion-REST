const evaluateUser = (e) => {
	upperAttrIterator(e.target, 'id')
	.then(res => {
		if(res != null) {
			setCookie('USelected', res)
			go('evaluation/')
		}
	})
	.catch(err => console.log(err))
}

const manageEvalUser = (e) => {
	upperAttrIterator(e.target, 'id')
	.then(id => {
		if(id != null) {
			fetchTo(
				window.location.origin+'/home/manage-user/'+id+'/'+e.target.value,
				'GET',
				null,
				async (result) => {
					if(result.snack) showSnack(result.msg, null, 'info')
					if(result.status === 200)
						window.location.reload(true)
				},
				(err) => {
					showSnack(
						(lang == 0) ? 'Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte'
									: 'Please open the browser console, copy the error and contact a support specialist.',
						null,
						'error'
					)
					console.error(err)
				}
			)
		}
	})
	.catch(err => console.log(err))
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
			.catch(err => {
				showSnack(
					(lang == 0) ? 'Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte'
								: 'Please open the browser console, copy the error and contact a support specialist.',
					null,
					'error'
				)
				console.error(err)
			})
		} else
			showSnack(
				(lang == 0) ? 'Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte'
							: 'Please open the browser console, copy the error and contact a support specialist.',
				null,
				'error'
			)
	})
	.catch(err => console.log(err))
}

window.addEventListener('load', async(e) => {
	eventAssigner('.evaluate', 'click', evaluateUser).catch((error) => console.error(error))
	eventAssigner('.manage-eval', 'click', manageEvalUser).catch((error) => console.error(error))
	eventAssigner('.generate-pdf', 'click', pdfFormatEval).catch((error) => console.error(error))
	//eventAssigner('#registerPersonnel', 'click', () => go('register/')).catch((error) => console.warn(error))
})

