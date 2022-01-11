const SNACK = { // Global access?
        success: {
            bgColor: 'bg-success',
            title: (lang == 0) ? 'Éxito' : 'Success'
        },
        secondary: {
            bgColor: 'bg-secondary',
            title: (lang == 0) ? 'Información' : 'Information'
        },
        warning: {
            bgColor: 'bg-warning',
            title: (lang == 0) ? 'Alerta' : 'Alert'
        },
        error: {
            bgColor: 'bg-danger',
            title: (lang == 0) ? 'Error' : 'Error'
        },
        info: {
            bgColor: 'bg-info',
            title: (lang == 0) ? 'Notificación' : 'Notification'
        }
    }

function showSnack(msg, title, style = []) {
    if($a('.snack-notification').length <= 3) {
        let id = 'snk-'+Math.random().toString(16).substring(2, 8)

        if(title == null || String(title).length <= 1) {
            title = style.title
        }

        let snackChildContainer = document.createElement('div'),
            firstDIV = document.createElement('div'),
            secondDIV = document.createElement('div'),
            toastSnackTitle = document.createElement('p'),
            toastBtn = document.createElement('button'),
            bodyDIV = document.createElement('div')

        snackChildContainer.classList.add('snack-notification', 'row', 'd-block', 'fade-anim', 'fade-anim-disappear')
        snackChildContainer.setAttribute('id', id)

        firstDIV.classList.add('p-0', 'my-1', 'toast', 'show')
        secondDIV.classList.add('toast-header', 'text-light', style.bgColor)
        toastSnackTitle.classList.add('me-auto', 'my-0', 'ms-1', 'fw-bold')
        toastSnackTitle.innerText = title

        toastBtn.setAttribute('type', 'button')
        toastBtn.setAttribute('role', 'button')
        toastBtn.setAttribute('data-bs-dismiss', 'toast')
        toastBtn.setAttribute('aria-label', 'Close')
        toastBtn.setAttribute('onclick', `hideSnack("${id}")`)
        toastBtn.classList.add('btn-close')

        bodyDIV.classList.add('toast-body')
        bodyDIV.innerHTML = msg

        secondDIV.appendChild(toastSnackTitle)
        secondDIV.appendChild(toastBtn)
        secondDIV.appendChild(toastBtn)
        firstDIV.appendChild(secondDIV)
        firstDIV.appendChild(bodyDIV)
        snackChildContainer.appendChild(firstDIV)

        
        $e('#snack-container').appendChild(snackChildContainer)
        setTimeout(() => $e(`#${id}`).classList.replace('fade-anim-disappear', 'fade-anim-appear'), 100)

        setTimeout(() => hideSnack(id), 3200)
    } else
        log('Toast overflow! Discarding new notifications', STYLE.error)
}

function hideSnack(id) {
    try {
        $e(`#${id}`).classList.replace('fade-anim-appear', 'fade-anim-disappear')
	    setTimeout(() => $e(`#${id}`).remove(), 250)
    } catch (error) { return }
}