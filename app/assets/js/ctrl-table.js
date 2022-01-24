const evaluateUser = (e) => {
    let tgt = e.target,
        idUserSelected

    while(tgt.parentNode) {
        tgt = tgt.parentNode
        if(tgt.getAttribute('id') != undefined) {
            idUserSelected = tgt.getAttribute('id')
            break
        }
    }

    setCookie('USelected', idUserSelected)
    go('evaluation/')
}

window.addEventListener('load', async(e) => {	
	eventAssigner('.evaluate', 'click', evaluateUser).catch((error) => console.error(error))

    $e('#btn-personnel-eval-format').addEventListener('click', async(e) => {

        fetch('http://localhost:999/home/evaluation-pdf/R001')
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
    })
})

