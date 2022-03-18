/**
 * Display a toast notification at the top of the page with different styles
 * @param {String} msg Text of the notification
 * @param {String} [title = null] title Title of the notification
 * @param {'success' | 'secondary' | 'warning' | 'error' | 'info'} [style='secondary'] style Style
**/

function showSnack(msg, title, style) {
	if($a('.snack-notification').length <= 3) {
		let id = 'snk-'+Math.random().toString(16).substring(2, 8)

		switch (style) {
			case 'success': style = {
					bgColor: 'bg-success',
					title: (lang == 0) ? 'Éxito' : 'Success'
				}
				break
			case 'warning': style = {
					bgColor: 'bg-warning',
					title: (lang == 0) ? 'Alerta' : 'Alert'
				}
				break
			case 'error': style = {
					bgColor: 'bg-danger',
					title: (lang == 0) ? 'Error' : 'Error'
				}
				break
			case 'info': style = {
					bgColor: 'bg-info',
					title: (lang == 0) ? 'Notificación' : 'Notification'
				}
				break
			default: {
				style = {
					bgColor: 'bg-secondary',
					title: (lang == 0) ? 'Información' : 'Information'
				}
				break
			}
		}

		if(title == null || title.length <= 1)
			title = style.title

		/*let snackChildContainer = document.createElement('div'),
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
		snackChildContainer.appendChild(firstDIV)*/


		//$e('#snack-container').appendChild(snackChildContainer)
		$e('#snack-container').insertAdjacentHTML(
			'beforeend',
			`<div class="snack-notification row d-block fade-anim fade-anim-disappear" id="${id}">
				<div class="p-0 my-1 toast show">
					<div class="toast-header text-light ${style.bgColor}">
						<p class="me-auto my-0 ms-1 fw-bold">${title}</p>
						<button type="button" role="button" data-bs-dismiss="toast" aria-label="Close"
							onclick="hideSnack('${id}')" class="btn-close">
						</button>
			</div><div class="toast-body">${msg}</div></div></div>`
		)

		setTimeout(() => $e(`#${id}`).classList.replace('fade-anim-disappear', 'fade-anim-appear'), 100)
		setTimeout(() => hideSnack(id), 4000)
	} else
		log('Toast overflow! Discarding new notifications', 'error')
}

function hideSnack(id) {
	try {
		$e(`#${id}`).classList.replace('fade-anim-appear', 'fade-anim-disappear')
		setTimeout(() => $e(`#${id}`).remove(), 250)
	} catch (error) { return }
}