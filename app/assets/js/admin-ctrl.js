window.addEventListener('load', async(e) => {
	eventAssigner('.btn-edit', 'click', (e) => {
		let tgt = e.target.getAttribute('data-id')

		if(String(tgt).length) {
			$a(`.${tgt}:not(.read-only)`).forEach(node => {
				node.disabled = false

				if(node.type === 'checkbox')
					node.setAttribute('data-restore', tgt.checked)
				else
					node.setAttribute('data-restore', tgt.value)
			})
			$e(`#save-${tgt}`).classList.remove('d-none')
			$e(`#save-${tgt}`).disabled = false
			$e(`#edit-${tgt}`).classList.add('d-none')
			$e(`#edit-${tgt}`).disabled = true
		} else
			return log(`[AD-CTRL] Not found ID target in button event (target = ${tgt})`, STYLE.error)
	})

	eventAssigner('input:not(.read-only)', 'change', (e) => {
		let tgt = e.target
		
		if('restore' in tgt.dataset) {
			if(tgt.value == tgt.getAttribute('data-restore'))
				tgt.classList.remove('edited')
			else
				tgt.classList.add('edited')
		}
	})
	
	eventAssigner('.btn-save', 'click', (e) => {
		let tgt = e.target.getAttribute('data-id'),
			package = { _id: tgt }
		
		if(String(tgt).length) {
			$a(`.${tgt}.edited`).forEach(node => {
				if(node.dataset.class == 'user_all' || node.dataset.class == 'user') {
					if(!('user' in package)) package['user'] = {} // if not exists user
					package.user[node.name] = node.value || node.checked
				}
				if(node.dataset.class == 'user_all' || node.dataset.class == 'user_info') {
					if(!('user_info' in package)) package['user_info'] = {} // if not exists user_info

					if(node.classList.contains('address')) { // for address information
						if(!('address' in package.user_info)) package.user_info['address'] = {}
						package.user_info.address[node.name] = node.value
					} else if(node.name == 'b_day') {  // for birthday information
						if(!('b_day' in package.user_info)) package.user_info['b_day'] = {}
						package.user_info.b_day.date = node.value
					} else
						package.user_info[node.name] = node.value || node.checked
				}
				if(node.dataset.class == 'evaluation') {
					if(!('evaluation' in package)) package['evaluation'] = {} // if not exists evaluation
					if(!(node.dataset.year in package.evaluation)) package.evaluation[node.dataset.year] = {} // and the years
					package.evaluation[node.dataset.year][node.name] = node.value || node.checked
				}
			})

			fetchTo(
				'http://localhost:999/admin-control/update',
				'POST',
				package,
				(result) => {
					console.log(result)
					$a(`.${tgt}:not(.read-only)`).forEach(node => {
						node.disabled = true
					})
					$e(`#save-${tgt}`).classList.add('d-none')
					$e(`#save-${tgt}`).disabled = true
					$e(`#edit-${tgt}`).classList.remove('d-none')
					$e(`#edit-${tgt}`).disabled = false
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