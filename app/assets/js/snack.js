function showSnack(msg, status) {
    let bgColor
    let id = Math.random().toString(16).substring(2, 8)

    switch(status) {
        case 'success':
            bgColor = 'bg-success'
            break
        
        case 'secondary':
            bgColor = 'bg-secondary'
            break
        
        case 'warning':
            bgColor = 'bg-warning'
            break
        
        case 'error':
            bgColor = 'bg-danger'
            break

        default:
            bgColor = 'bg-info'
            break
    }

	$('#noti').append(
        `<div id="${id}" class="row d-block animate__animated">
            <div class="p-0 my-1 toast show">
                <div class="toast-header ${bgColor} text-light">
                <strong class="me-auto">Notificación</strong>
                <button type="button" class="btn-close" role="button" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            <div class="toast-body">${msg}</div>
		</div></div>`
    )
    $(`#${id}`).addClass('animate__fadeIn')

	setTimeout(() => {
        hideSnack(id)
	}, 3000)
}

function hideSnack(id) {
    $(`#${id}`).removeClass('animate__fadeIn')
    $(`#${id}`).addClass('animate__fadeOut')
	setTimeout(() => {
        $(`#${id}`).remove()
    }, 1000)
}