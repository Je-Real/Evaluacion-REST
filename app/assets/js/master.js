
// 👇 Production mode
'use strict'

const d = new Date()
const style = {
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
const log = (text, styleTypes = []) => {
    let options = style.base.join(';') + ';';
    options += styleTypes.join(';'); // Add any additional styles
    console.log(`%c${text}`, options);
}

const changeLang = () => {
    let btnChecked = document.body.querySelector('#btn-lang').checked
    
    if(btnChecked) localStorage.setItem('lang', 'en')
    else localStorage.setItem('lang', 'es')

    setTimeout(async() => {
        await $('#load-b').removeClass('hidden').addClass('show')
        setTimeout(() => {
            window.location.href = String(location.href)
        }, 200)
    }, 200)
}

let tf = false, tr = false,
    frameL = document.getElementById('floatingLogin'),
    frameP = document.getElementById('floatingPass'),
    frameR = document.getElementById('floatingRegister'),
    glass = document.getElementById('layoutSidenav')

window.addEventListener('DOMContentLoaded', async(e) => {
    if(localStorage.getItem('lang') === 'en') {
        document.querySelector('html').setAttribute('lang', 'en')
        Array.prototype.forEach.call(
			document.querySelectorAll('*[data-lang="es"]'),
			(node) => { node.remove() }
        )
        document.body.querySelector('#btn-lang').checked = true
    } else {
        document.querySelector('html').setAttribute('lang', 'es')
        Array.prototype.forEach.call(
			document.querySelectorAll('*[data-lang="en"]'),
			(node) => { node.remove() }
        )
    }

    eventAssigner('#btn-lang', 'change', changeLang)

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle')
    if(sidebarToggle) {
        if(localStorage.getItem('sb|sidebar-toggle') === 'true') {
            document.body.classList.toggle('sb-sidenav-toggled')
        }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault()
            document.body.classList.toggle('sb-sidenav-toggled')
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'))
        })
    }

    let fade_away = true

    if($('#layoutNavbar').attr('data-log') === 'false') {
        await getCookie(0)
        .then(async(data) => {
            fade_away = false
            if(data[0] != '' && data[0] != undefined) {
                try {
                    let cookieData = JSON.parse(data[0])
                    showSnack('Iniando sesión...', 'info')
                    login(cookieData.user, cookieData.pass)

                    if(data[1] != undefined) {
                        await setCookie('requested-page', undefined)
                        .then(() => {
                            setTimeout(() => {
                                go(data[1])
                            }, 2500)
                        })
                        .catch((error) => {
                            return console.error(error)
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
    
    if(fade_away) {
        setTimeout(async() => {
            await $('#load-b').addClass('fade')
            setTimeout(() => {
                $('#load-b').addClass('hidden')
            }, 200)
        }, 200)
        setTimeout(async() => {
            await $('.deletable').remove() //Remove all the "deletable" elements after 1 sec
        }, 1000)
    }
})

async function eventAssigner(elementSelector, eventClass, funcEvent) {
	try {
		Array.prototype.forEach.call(
			document.querySelectorAll(elementSelector),
			(node) => {
				node.addEventListener(eventClass, funcEvent)
		})
		return true
	} catch (error) {
		console.error(error)
		throw false
	}
}

async function eventUnassigner(elementSelector, eventClass, funcEvent) {
	try {
		Array.prototype.forEach.call(
			document.querySelectorAll(elementSelector),
			(node) => {
				node.removeEventListener(eventClass, funcEvent)
		})
		return true
	} catch (error) {
		console.error(error)
		throw false
	}
}

function darkMode() {
    $('body').addClass('dark')
    if($('*').hasClass('bg-light')) {
        $('*').removeClass('bg-light')
        $('*').addClass('bg-dark')
    }
}

//Capture Enter key in inputs
function onEnterHandler(e) {
    let code = e.which || e.keyCode
    if(code === 13) {
      login()
    }
}

function outSession(clicked) {
    if(clicked) {
        setTimeout(() => {
            go("inicio/")
        }, 2500)
    }
}

function toggleFloating(floating) {
    if(tf || floating === 0) {
        try { frameL.className = frameL.className.replace('show', 'hide') }
        catch { console.log('Skiping Frame Login') }
        try { frameP.className = frameP.className.replace('show', 'hide') }
        catch { console.log('Skiping Frame Password') }

        glass.className = ''
    } else {
        if(floating === 1) {
            try { frameL.className = frameL.className.replace('hide', 'show') }
            catch { console.log('Skiping Frame Login') }
            try { frameP.className = frameP.className.replace('show', 'hide') }
            catch { console.log('Skiping Frame Password') }

            if(glass.className == 'blur-off') 
                glass.className = glass.className.replace('blur-off', 'blur-on')
            else 
                glass.className = 'blur-on'

            $('#_id-txt').focus()
        } else if(floating === 2) {
            try { frameL.className = frameL.className.replace('show', 'hide') }
            catch { console.log('Skiping Frame Login') }
            try { frameP.className = frameP.className.replace('hide', 'show') }
            catch { console.log('Skiping Frame Password') }

            if(glass.className == 'blur-off')
                glass.className = glass.className.replace('blur-off', 'blur-on')
            else
                glass.className = 'blur-on position-fixed'

            $('#_id-u-txt').focus()
        }
    }
}

function login(u, p) {
    u = (u) ? u : (($('#_id-txt').val()) ? $('#_id-txt').val() : undefined)
    p = (p) ? p : (($('#pass').val()) ? $('#pass').val() : undefined)

    if(u === undefined) return console.error('login failed!')

    $.ajax({
        type: 'POST',
        url: 'http://localhost:666/sesion/login',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ _id: u, pass: p }),
        dataType: 'json',
        async: true,
        success: async(result) => {
            if(result.noti) {
                showSnack(result.msg, 'success')
            } else {
                $('#loginMsg').addClass('text-danger')
                $('#loginMsg').html(result.msg)
            }

            if(result.status === 200) {
                $('#load-b').removeClass('hidden fade')
                toggleFloating(0)
                await setCookie('user', JSON.stringify(result.data))
                .then(() => {
                    return go("inicio/")
                })
                .catch(() => {
                    showSnack('Status: Cookies error', 'warning')
                })
            }
        },
        error: async(xhr, status, error, result) => {
            console.error('Login: '+error)
            showSnack(result.msg, 'error')
        }
    })
}

function logout() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:666/sesion/logout',
        dataType: 'json',
        async: true,
        success: async(result) => {
            if(result.status === 200) {
                outSession(true)
                $('#load-b').removeClass('hidden fade')
                await eatCookies()
                    .finally(() => {
                        setTimeout(() => {
                            go("inicio/")
                        }, 500)
                    })
            } else {
                showSnack(`Error: ${result.msg}`, 'error')
            }
        },
        error: async(xhr, status, error) => { 
            showSnack(`Status: ${status}. Error: ${error}`, 'error')
        }
    })
}

function go(place) {
    setCookie('go-to', place)
    window.location.href = String(location.href).slice(0, 20+1)+place
}