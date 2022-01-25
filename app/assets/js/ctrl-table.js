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

const pdfFormatEval = (e) => {
    upperAttrIterator(e.target, 'id')
    .then(res => {
        if(res != null) {
            fetch('http://localhost:999/home/evaluation-pdf/'+res)
                .then(async res => await res.arrayBuffer()) // response data to array buffer
                .then(data => {
                    if(data == null || data == undefined)
                        return showSnack('Server error', null, SNACK.error)
                    const blob = new Blob([data]) // Create a Blob object
                    const url = URL.createObjectURL(blob) // Create an object URL
                    download(url, 'eval-format-output.pdf') // Download file
                    URL.revokeObjectURL(url) // Release the object URL
                })
                .catch(err => {
                    showSnack(
                        (lang == 0) ? 'Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte'
                                    : 'Please open the browser console, copy the error and contact a support specialist.',
                        null,
                        SNACK.error
                    )
                    console.error(err)
                })
        } else
            showSnack(
                (lang == 0) ? 'Por favor abra la consola del navegador, copie el error y contacte con un especialista en soporte'
                            : 'Please open the browser console, copy the error and contact a support specialist.',
                null,
                SNACK.error
            )
    })
    .catch(err => console.log(err))
}

window.addEventListener('load', async(e) => {	
	eventAssigner('.evaluate', 'click', evaluateUser).catch((error) => console.error(error))
	eventAssigner('.generate-pdf', 'click', pdfFormatEval).catch((error) => console.error(error))
})

