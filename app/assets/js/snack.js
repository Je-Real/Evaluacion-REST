function showSnack(msg, title, status) {
    let id = 'snk-'+Math.random().toString(16).substring(2, 8),
        bgColor

    switch(status) {
        case 'success':
            bgColor = 'bg-success'
            if(title == null)
                title = (lang == 0) ? 'Éxito' : 'Success'
            break
        
        case 'secondary':
            bgColor = 'bg-secondary'
            if(title == null)
                title = (lang == 0) ? 'Información' : 'Information'
            break
        
        case 'warning':
            bgColor = 'bg-warning'
            if(title == null)
                title = (lang == 0) ? 'Alerta' : 'Alert'
            break
        
        case 'error':
            bgColor = 'bg-danger'
            if(title == null)
                title = (lang == 0) ? 'Error' : 'Error'
            break

        default:
            bgColor = 'bg-info'
            if(title == null)
                title = (lang == 0) ? 'Notificación' : 'Notification'
            break
    }

    let snackChildContainer = document.createElement('div'),
        firstDIV = document.createElement('div'),
        secondDIV = document.createElement('div'),
        toastTitle = document.createElement('p'),
        toastBtn = document.createElement('button'),
        bodyDIV = document.createElement('div')

    snackChildContainer.classList.add('row', 'd-block', 'fade')
    snackChildContainer.setAttribute('id', id)

    firstDIV.classList.add('p-0', 'my-1', 'toast', 'show')
    secondDIV.classList.add('toast-header', 'text-light', bgColor)
    toastTitle.classList.add('me-auto', 'fw-bold')

    toastBtn.setAttribute('type', 'button')
    toastBtn.setAttribute('role', 'button')
    toastBtn.setAttribute('data-bs-dismiss', 'toast')
    toastBtn.setAttribute('aria-label', 'Close')
    toastBtn.classList.add('btn-close')

    bodyDIV.classList.add('toast-body')
    bodyDIV.innerHTML = msg

    secondDIV.appendChild(toastBtn)
    secondDIV.appendChild(toastBtn)
    firstDIV.appendChild(secondDIV)
    firstDIV.appendChild(bodyDIV)
    snackChildContainer.appendChild(firstDIV)

	$e('#snack-container').appendChild(snackChildContainer)
    $e(`#${id}`).classList.add('animate__fadeIn')

	setTimeout(() => hideSnack(id), 3000)
}

function hideSnack(id) {
    $e(`#${id}`).classList.remove('animate__fadeIn')
    $e(`#${id}`).classList.add('animate__fadeOut')

	setTimeout(() => $e(`#${id}`).remove(), 1000)
}