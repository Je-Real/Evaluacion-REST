// 👇 Production mode
//'use strict'

const DATE = new Date()
const CURRENT_YEAR = String(DATE.getFullYear())

/**
 * Get one element
 * @param {keyof HTMLElementTagNameMap} selector Selector
 * @returns Element
**/
const $e = (selector) => document.querySelector(selector)
/**
 * Get a list of elements
 * @param {keyof HTMLElementTagNameMap} selector Selector
 * @returns List of elements
**/
const $a = (selector) => document.querySelectorAll(selector)

/**
 * Print a pretty text log in browser's console with different styles
 * @param {String} text Text
 * @param {'error' | 'success' | 'warning' | 'info' | 'pink' | 'cian' |'light'} style Log style
**/
const log = (text, style) => {
	const base = [
		"color: #fff",
		"background-color: #292929",
		"padding: 2px 4px",
		"border-radius: 2px"
	]

	switch(style) {
		case 'error': style = [
			"color: #eee",
			"background-color: #ed416c"
			]
			break
		case 'success': style = [
			"background-color: #4caa24"
			]
			break
		case 'warning': style = [
			"background-color: #b08210"
			]
			break
		case 'info': style = [
			"background-color: #0f87ae"
			]
			break
		case 'pink': style = [
			"background-color: #8a3e98"
			]
			break
		case 'cian': style = [
			"background-color: #189a84"
			]
			break
		case 'light': style = [
				"color: #1e1e1e",
				"background-color: #d3d3d3"
			]
			break
	}


	let options = base.join(';') + ';';
	options += style.join(';'); // Add any additional styles
	console.log(`%c${text}`, options);
}

/**
 * Control the loading spinner
 * @param {'load' | 'wait'} type Select from spinner-loading or spinner-waiting
 * @param {Boolean} show Show the spinner
 * @return Boolean
**/
const spinner = async(type, show) => {
	if(type == 'load')
		type = $e('#spinner-loading')
	else if (type == 'wait')
		type = $e('#spinner-waiting')
	else
		return false

	if(show) {
		setTimeout(async() => {
			type.classList.remove('hide', 'fade')
		}, 200)
		return true
	} else {
		setTimeout(async() => {
			type.classList.add('fade')
			setTimeout(() => {
				type.classList.add('hide')
			}, 200)
		}, 200)
		return true
	}
}

const changeLang = () => {
	let btnChecked = $e('body').querySelector('#btn-lang').checked

	if(btnChecked) localStorage.setItem('lang', 'en')
	else localStorage.setItem('lang', 'es')

	setTimeout(async() => {
		spinner('load', true)
		.then(res => {
			if(res) {
				setTimeout(() => {
					window.location.reload(false)
				}, 200)
			}
		})
	}, 200)
}

/**
 * @param {String} url
**/
function go(url) {
	spinner('load', true)
	.then(setTimeout(() => {
		if(url[0] != '/') // If url has no '/' at the start, add it
			url = '/'+url
		if(url[url.length-1] != '/') // If url has no '/' at the end, add it
			url = url+'/'
		setCookie('go-to', url)
		return window.location.pathname = url
	}, 200))
}

async function upperAttrIterator(target, attributeName) {
	try{
		if(target.getAttribute(attributeName))
			return target.getAttribute(attributeName)
		else {
			while(target.parentNode) {
				target = target.parentNode
				if(target.getAttribute(attributeName))
					return target.getAttribute(attributeName)
			}
		}
		//log(`Couldn't find attribute ${attributeName} in parentsNodes of ${target}`, 'error')
		return null
	} catch(e) { throw e }
}

async function fetchTo(url = '', method = '', data = {}, onSuccess, onError) {
	let REQ_PARAMS
	method = method.toUpperCase()

	if(method === 'POST' || method === 'GET') {
		REQ_PARAMS = (method === 'POST') ? {
			method: method,
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(data)
		} : {}

		return await fetch(url, REQ_PARAMS)
		.then(res => res.json())
		.then(data => onSuccess(data))
		.catch(error => onError(error))
	} else onError('Error: Methods supported are "GET" and "POST"')
}

const download = (path, filename) => {
	// Create a new link
	const anchor = document.createElement('a')
	anchor.href = path
	anchor.download = filename

	// Append to the DOM
	document.body.appendChild(anchor)

	// Trigger `click` event
	anchor.click()

	// Remove element from DOM
	document.body.removeChild(anchor)
}

async function eventAssigner(selector = '', eventClass, funcEvent ) {
	try {
		$a(selector).forEach((node) => {node.addEventListener(eventClass, funcEvent)})
		return true
	} catch (error) {
		throw error
	}
}

async function eventUnassigner(selector, eventClass, funcEvent) {
	try {
		$a(selector).forEach((node) => {node.removeEventListener(eventClass, funcEvent)})
		return true
	} catch (error) {
		console.error(error)
		throw false
	}
}

var lang

window.addEventListener('DOMContentLoaded', async(e) => {
	if(localStorage.getItem('lang') === 'en') {
		lang = 1
		$e('html').setAttribute('lang', 'en')

		$a('*[data-lang="es"]').forEach(
			(node) => { node.remove() }
		)
		if($e('#btn-lang'))
			$e('#btn-lang').checked = true
	} else {
		lang = 0
		$e('html').setAttribute('lang', 'es')
		$a('*[data-lang="en"]').forEach(node => { node.remove() })
	}

	await fetchTo(
		'http://localhost:999/session/lang',
		'POST',
		{lang: lang},
		(result) => { if(result.status != 200) console.error(result.error) },
		(error) => console.error(error)
	)

	eventAssigner('#btn-lang', 'change', changeLang)

	// Toggle the side navigation
	const sidebarToggle = $e('#sidebarToggle')
	if(sidebarToggle) {
		if(localStorage.getItem('sb|sidebar-toggle') === 'true')
			$e('body').classList.toggle('sb-sidenav-toggled')
		sidebarToggle.addEventListener('click', event => {
			event.preventDefault()
			$e('body').classList.toggle('sb-sidenav-toggled')
			localStorage.setItem('sb|sidebar-toggle', $e('body').classList.contains('sb-sidenav-toggled'))
		})
	}

	let fade_away = true

	try {
		if($e('#layoutNavbar').getAttribute('data-log') === 'false') {
			await getCookie(0)
			.then(async(data) => {
				fade_away = false
				if(data[0] != '' && data[0] != undefined) {
					try {
						let cookieData = JSON.parse(data[0])
						showSnack(
							(lang == 0) ? 'Iniciando sesión...' : 'Logging in...',
							(lang == 0) ? 'Inicio de sesión' : 'Log in', 'info'
						)
						login(cookieData.user, cookieData.pass)

						if(data[1] != undefined) {
							await setCookie('requested-page', undefined)
							.then(() => {
								setTimeout(() => go(data[1]), 2500)
							})
							.catch((error) => {
								return console.error('requested-page: '+error)
							})
						}
					} catch(error) {
						return console.error(error)
					}
				}
				return fade_away = true
			})
			.catch((error) => {
				fade_away = true
				throw console.error('error: '+error)
			})
		}
	} catch (error) {
		console.error(error);
	}

	if(fade_away) {
		spinner('load', false)
		.then(res => {
			if(res) {
				setTimeout(async() => {
					$a('.deletable').forEach((node) => {node.remove()}) //Remove all the "deletable" elements after 1 sec
				}, 1000)
			}
		})
	}
})

function outSession(clicked) {
	if(clicked) setTimeout(() => go('home/'), 2500)
}

function logout() {
	fetchTo(
		'http://localhost:999/session/log-out',
		'GET',
		null,
		async(result) => {
			if(result.status === 200) {
				outSession(true)
				spinner('load', true)
				.then(async() => {
					await eatCookies()
						.finally(() => {
							setTimeout(() => {
								go('home/')
							}, 500)
						})
				})
			} else {
				showSnack(
					`Error: ${result.msg}`,
					null, 'error'
				)
			}
		},
		async(error) => console.error('Log out: '+error)
	)
}