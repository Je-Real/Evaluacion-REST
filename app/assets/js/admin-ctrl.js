window.addEventListener('load', async(e) => {
	eventAssigner('.btn-edit', 'click', (e) => {
		// Edit a user info, show buttons & set a restore point for all inputs in case of cancel
		let tgt = e.target.getAttribute('data-id')

		if(String(tgt).length) {
			$a(`.${tgt}:not(.read-only)`).forEach(node => {
				node.disabled = false

				if(node.type === 'checkbox')
					node.setAttribute('data-restore', node.checked)
				else
					node.setAttribute('data-restore', node.value)
			})
			$a(`#save-${tgt}, #cancel-${tgt}`).forEach(node => {
				node.classList.remove('d-none')
				node.disabled = false
			})
			$e(`#edit-${tgt}`).classList.add('d-none')
			$e(`#edit-${tgt}`).disabled = true
		} else
			return log(`[AD-CTRL] Not found ID target in button event (target = ${tgt})`, STYLE.error)
	})

	eventAssigner('input:not(.read-only)', 'change', (e) => {
		// Highlight the inputs that had been modified
		let tgt = e.target
		
		if('restore' in tgt.dataset) {
			if(tgt.value == tgt.getAttribute('data-restore'))
				tgt.classList.remove('edited')
			else
				tgt.classList.add('edited')
		}
	})

	eventAssigner('.btn-cancel', 'click', (e) => {
		// Cancel the current operation (lock inputs) & restore the original values
		let tgt = e.target.getAttribute('data-id')

		$a(`.${tgt}.edited`).forEach(node => {
			if(node.type === 'checkbox')
				node.checked = node.dataset.restore
			else
				node.value = node.dataset.restore
			node.removeAttribute('data-restore')
		})

		$a(`.${tgt}:not(.read-only)`).forEach(node => {
			node.disabled = true
		})
		$a(`#save-${tgt}, #cancel-${tgt}`).forEach(node => {
			node.classList.add('d-none')
			node.disabled = true
		})
		$e(`#edit-${tgt}`).classList.remove('d-none')
		$e(`#edit-${tgt}`).disabled = false
	})
	
	eventAssigner('.btn-save', 'click', (e) => {
		// Save the information 🤠
		let tgt = e.target.getAttribute('data-id'),
			pkg = { _id: tgt }
		
		if(String(tgt).length) {
			$a(`.${tgt}.edited`).forEach(node => {
				if(node.dataset.class == 'user_all' || node.dataset.class == 'user') {
					if(!('user' in pkg)) pkg['user'] = {} // if not exists user
					pkg.user[node.name] = node.value || node.checked
				}
				if(node.dataset.class == 'user_all' || node.dataset.class == 'user_info') {
					if(!('user_info' in pkg)) pkg['user_info'] = {} // if not exists user_info

					if(node.classList.contains('address')) { // for address information
						if(!('address' in pkg.user_info)) pkg.user_info['address'] = {}
						pkg.user_info.address[node.name] = node.value
					} else if(node.name == 'b_day') {  // for birthday information
						if(!('b_day' in pkg.user_info)) pkg.user_info['b_day'] = {}
						pkg.user_info.b_day.date = node.value
					} else
						pkg.user_info[node.name] = node.value || node.checked
				}
				if(node.dataset.class == 'evaluation') {
					if(node.checked == true) {
						if(!('evaluation' in pkg))
							pkg['evaluation'] = { records: {} } // if not exists evaluation.records
						if(!(node.dataset.year in pkg.evaluation.records)) 
							pkg.evaluation.records[node.dataset.year] = { disabled: true } // and the years
					} else {
						if(!('rm_evaluation' in pkg))
							pkg['rm_evaluation'] = {}
						pkg.rm_evaluation[`records.${node.dataset.year}`] = ''
					}
				}
			})

			console.log(pkg)

			fetchTo(
				'http://localhost:999/admin-control/update',
				'POST',
				pkg,
				(result) => {
					if(result.status === 200) {
						showSnack((lang == 0) ? 'Cambios guardados' : 'Changes saved', null, SNACK.success)
						$a(`.${tgt}:not(.read-only)`).forEach(node => {
							node.disabled = true
						})
						$a(`#save-${tgt}, #cancel-${tgt}`).forEach(node => {
							node.classList.add('d-none')
							node.disabled = true
						})
						$e(`#edit-${tgt}`).classList.remove('d-none')
						$e(`#edit-${tgt}`).disabled = false
					} else 
						showSnack(result.error, null, SNACK.error)
				},
				(error) => {
					console.error(error)
				}
			)

			// TODO: Send new data to update the DB
		} else
			return log(`[AD-CTRL] Not found ID target in button event (target = ${tgt})`, STYLE.error)
	})

})