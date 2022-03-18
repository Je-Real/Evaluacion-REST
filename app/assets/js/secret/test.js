window.addEventListener('load', async(e) => {
	eventAssigner('#d', 'click', async() => {
		console.log('click')

		await fetch(window.location.origin+'/secret/test/download/')
			//.then(data => console.log(data))
			.then(async res => await res.arrayBuffer()) // response data to array buffer
			.then(data => {
				if(data == null || data == undefined)
					return showSnack('Server error', null, 'error')
				const blob = new Blob([data]) // Create a Blob object
				const url = URL.createObjectURL(blob) // Create an object URL
				download(url, `doc.xlsx`) // Download file
				URL.revokeObjectURL(url) // Release the object URL
			})
			.catch(error => console.error(error))
	})
})