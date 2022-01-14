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
    go('evaluacion/')
}

window.addEventListener('load', async(e) => {	
	eventAssigner('.evaluate', 'click', evaluateUser).catch((error) => console.error(error))
})

