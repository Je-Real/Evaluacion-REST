// 👇 Production mode
'use strict'

const DATE = new Date()
const STYLE = {
    base: [
        "color: #fff",
        "background-color: #292929",
        "padding: 2px 4px",
        "border-radius: 2px"
    ],
    error: [
        "color: #eee",
        "background-color: #ed416c"
    ],
    success: [
        "background-color: #4caa24"
    ],
    warning: [
        "background-color: #b08210"
    ],
    info: [
        "background-color: #0f87ae"
    ],
    pink: [
        "background-color: #8a3e98"
    ],
    cian: [
        "background-color: #189a84"
    ],
    light: [
        "color: #1e1e1e",
        "background-color: #d3d3d3"
    ],
}

const $e = (selector) => (typeof selector == 'string') ? document.querySelector(selector) : null
const $a = (selector) => (typeof selector == 'string') ? document.querySelectorAll(selector) : null

const log = (text, styleTypes = []) => {
    let options = STYLE.base.join(';') + ';';
    options += styleTypes.join(';'); // Add any additional styles
    console.log(`%c${text}`, options);
}

const changeLang = () => {
    let btnChecked = $e('body').querySelector('#btn-lang').checked
    
    if(btnChecked) localStorage.setItem('lang', 'en')
    else localStorage.setItem('lang', 'es')

    setTimeout(async() => {
        $e('#load-b').classList.replace('hidden', 'show')
        setTimeout(() => {
            window.location.reload(false)
        }, 200)
    }, 200)
}

async function upperAttrIterator(target, attributeName) {
    try{
        while(target.parentNode) {
            target = target.parentNode
            if(target.getAttribute(attributeName) != undefined)
                return target.getAttribute(attributeName)
        }
        log(`Couldn't find attribute ${attributeName} in parentsNodes of ${target}`, STYLE.error)
        return null
    } catch (e) { throw e }
}

async function fetchTo(url = '', method = '', data = {}, onSuccess, onError) {
    let REQ_PARAMS
    method = method.toUpperCase()
    
    if(method === 'POST') {
        if(typeof data == 'object') {
            REQ_PARAMS = {
                method: method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }

            return await fetch(url, REQ_PARAMS)
                .then(res => res.json())
                .then(data => onSuccess(data))
                .catch(error => onError(error))
        } else
            throw 'Error: Data sent is not an Object type'
    } else if (method === 'GET') {
        return await fetch(url)
            .then(res => res.json())
            .then(data => onSuccess(data))
            .catch(error => onError(error))
    } else
        throw 'Error: Methods supported are "GET" and "POST"'
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
		$a(selector).forEach(
			(node) => {
				node.addEventListener(eventClass, funcEvent)
		})
		return true
	} catch (error) {
		throw error
	}
}

async function eventUnassigner(selector, eventClass, funcEvent) {
	try {
		$a(selector).forEach(
			(node) => {
				node.removeEventListener(eventClass, funcEvent)
		})
		return true
	} catch (error) {
		console.error(error)
		throw false
	}
}

let tf = false, tr = false,
    frameL = $e('#floatingLogin'),
    frameP = $e('#floatingPass'),
    frameR = $e('#floatingRegister'),
    glass = $e('#layoutSidenav'),
    lang = null

window.addEventListener('DOMContentLoaded', async(e) => {
    if(localStorage.getItem('lang') === 'en') {
        lang = 1
        $e('html').setAttribute('lang', 'en')

        $a('*[data-lang="es"]').forEach(
			(node) => { node.remove() }
        )
        document.body.querySelector('#btn-lang').checked = true
    } else {
        lang = 0
        $e('html').setAttribute('lang', 'es')

        $a('*[data-lang="en"]').forEach(
			(node) => { node.remove() }
        )
    }

    eventAssigner('#btn-lang', 'change', changeLang)

    // Toggle the side navigation
    const sidebarToggle = $e('#sidebarToggle')
    if(sidebarToggle) {
        if(localStorage.getItem('sb|sidebar-toggle') === 'true') {
            $e('body').classList.toggle('sb-sidenav-toggled')
        }
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
                            (lang == 0) ? 'Inicio de sesión' : 'Log in', SNACK.info
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
        setTimeout(async() => {
            await $e('#load-b').classList.add('fade')
            setTimeout(() => {
                $e('#load-b').classList.add('hidden')
            }, 200)
        }, 200)
        setTimeout(async() => {
            await $a('.deletable').forEach((node) => {node.remove()}) //Remove all the "deletable" elements after 1 sec
        }, 1000)
    }
})

function outSession(clicked) {
    if(clicked) setTimeout(() => go("home/"), 2500)
}

function login(u, p) {
    u = (u) ? u : (($e('#_id-txt').value) ? $e('#_id-txt').value : null)
    p = (p) ? p : (($e('#pass').value) ? $e('#pass').value : null)

    if(u == null || p == null)
        showSnack(
            (lang == 0) ? 'Revisa los campos de inicio de sesión, por favor'
                        : 'Check the session fields, please',
            null, SNACK.error
        )
    else
        fetchTo(
            'http://localhost:999/session/log-in',
            'POST',
            { _id: u, pass: p },
            async(result) => {
                if(result.msg) {
                    showSnack(
                        result.msg,
                        null, SNACK.info
                    )
                }

                if(result.status === 200) {
                    $e('#load-b').classList.remove('hidden', 'fade')
                    await setCookie('user', JSON.stringify(result.data))
                    .then(() => {
                        return go("home/")
                    })
                    .catch(() => {
                        showSnack(
                            (lang == 0) ? 'Falla de Cookies' : 'Cookies failure',
                            null, SNACK.warning
                        )
                    })
                }
            },
            async(error) => console.error(error)
        )
}

function logout() {
    fetchTo(
        'http://localhost:999/session/log-out',
        'GET',
        null,
        async(result) => {
            if(result.status === 200) {
                outSession(true)
                $e('#load-b').classList.remove('hidden', 'fade')
                await eatCookies()
                    .finally(() => {
                        setTimeout(() => {
                            go('home/')
                        }, 500)
                    })
            } else {
                showSnack(
                    `Error: ${result.msg}`,
                    null, SNACK.error
                )
            }
        },
        async(error) => console.error('Log out: '+error)
    )
}

function go(url) {
    setCookie('go-to', url)
    window.location.href = String(location.href).slice(0, 20+1)+url
}