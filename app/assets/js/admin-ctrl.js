window.addEventListener('load', async(e) => {
	eventAssigner('.btn-edit', 'click', (e) => {
        let target = e.target.getAttribute('data-id')

        try {
            if(String(target).length) {
                $a(`.${target}:not(.read-only)`).forEach(node => {
                    node.disabled = false
                })
                $e(`#save-${target}`).classList.remove('d-none')
                $e(`#edit-${target}`).classList.add('d-none')
            } else
                return log(`[AD-CTRL] Not found ID target in button event (target = ${target})`, STYLE.error)
        } catch (error) {
            log(`[AD-CTRL] Error with ID target in button event (target = ${target})`, STYLE.error)
            console.error(error)
        }
    })
	
    eventAssigner('.btn-save', 'click', (e) => {
        let target = e.target.getAttribute('data-id')
        
        try {
            if(String(target).length) {
                $a(`.${target}:not(.read-only)`).forEach(node => {
                    node.disabled = true
                })
                $e(`#save-${target}`).classList.add('d-none')
                $e(`#edit-${target}`).classList.remove('d-none')

                // TODO: Send new data to update the DB
            } else
                return log(`[AD-CTRL] Not found ID target in button event (target = ${target})`, STYLE.error)
        } catch (error) {
            log(`[AD-CTRL] Error with ID target in button event (target = ${target})`, STYLE.error)
            console.error(error)
        }
    })

    
})