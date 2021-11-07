
// 👇 Production mode
//'use strict'
const d = new Date()

var tf = false,
    tr = false,
    frameL = document.getElementById('floatingLogin'),
    frameP = document.getElementById('floatingPass'),
    frameR = document.getElementById('floatingRegister'),
    glass = document.getElementById('layoutSidenav')

$(document).ready(async() => {
    var fade_away = true

    if ($('#layoutNavbar').attr('data-log') === 'false') {
        await getCookie(0)
        .then(async(data) => {
            fade_away = false
            if (data[0] != '' && data[0] != undefined) {
                try {
                    var cookieData = JSON.parse(data[0])
                    showSnack('Iniando sesión...', 'info')
                    login(cookieData.user, cookieData.pass)

                    if (data[1] != undefined) {
                        await setCookie('requested-page', undefined)
                        .then(() => {
                            setTimeout(() => {
                                window.location.href = data[1]
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
    
    if (fade_away) {
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

    /* select with effect
    $('select.dropdown').each(function() {
        var dropdown = $('<div/>').addClass('dropdown selectDropdown')
    
        $(this).wrap(dropdown)
    
        var label = $('<span/>').text($(this).attr('placeholder')).insertAfter($(this))
        var list = $('<ul/>')
    
        $(this).find('option').each(function() {
            list.append($('<li/>').append($('<a/>').text($(this).text())))
        })
    
        list.insertAfter($(this))
    
        if ($(this).find('option:selected').length) {
            label.text($(this).find('option:selected').text())
            list.find('li:contains(' + $(this).find('option:selected').text() + ')').addClass('active')
            $(this).parent().addClass('filled')
        }
    
    })
    
    $(document).on('click touch', '.selectDropdown ul li a', function(e) {
        e.preventDefault()
        var dropdown = $(this).parent().parent().parent()
        var active = $(this).parent().hasClass('active')
        var label = active ? dropdown.find('select').attr('placeholder') : $(this).text()
    
        dropdown.find('option').prop('selected', false)
        dropdown.find('ul li').removeClass('active')
    
        dropdown.toggleClass('filled', !active)
        dropdown.children('span').text(label)
    
        if (!active) {
            dropdown.find('option:contains(' + $(this).text() + ')').prop('selected', true)
            $(this).parent().addClass('active')
        }
    
        dropdown.removeClass('open')
    })
    
    $('.dropdown > span').on('click touch', function(e) {
        var self = $(this).parent()
        self.toggleClass('open')
    })
    
    $(document).on('click touch', function(e) {
        var dropdown = $('.dropdown')
        if (dropdown !== e.target && !dropdown.has(e.target).length) {
            dropdown.removeClass('open')
        }
    })*/
})

//Capture Enter key in inputs
function onEnterHandler(event) {
    var code = event.which || event.keyCode
    if (code === 13) {
      login()
    }
}

function outSession(clicked) {
    if (clicked) {
        setTimeout(() => {
            window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
        }, 2500)
    }
}

function toggleFloating(floating) {
    if (tf || floating === 0) {
        try { frameL.className = frameL.className.replace('show', 'hide') }
        catch { console.log('Skiping Frame Login') }
        try { frameP.className = frameP.className.replace('show', 'hide') }
        catch { console.log('Skiping Frame Password') }

        glass.className = ''
    } else {
        if (floating === 1) {
            try { frameL.className = frameL.className.replace('hide', 'show') }
            catch { console.log('Skiping Frame Login') }
            try { frameP.className = frameP.className.replace('show', 'hide') }
            catch { console.log('Skiping Frame Password') }

            if (glass.className == 'blur-off') 
                glass.className = glass.className.replace('blur-off', 'blur-on')
            else 
                glass.className = 'blur-on'

            $('#_id-txt').focus()
        } else if (floating === 2) {
            try { frameL.className = frameL.className.replace('show', 'hide') }
            catch { console.log('Skiping Frame Login') }
            try { frameP.className = frameP.className.replace('hide', 'show') }
            catch { console.log('Skiping Frame Password') }

            if (glass.className == 'blur-off')
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

    if (u === undefined) return console.error('login failed!')

    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/sesion/login',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ _id: u, pass: p }),
        dataType: 'json',
        async: true,
        success: async(result) => {
            if (result.noti) {
                showSnack(result.msg, 'success')
            } else {
                $('#loginMsg').addClass('text-danger')
                $('#loginMsg').html(result.msg)
            }

            if (result.status === 200) {
                $('#load-b').removeClass('hidden fade')
                toggleFloating(0)
                await setCookie('user', JSON.stringify(result.data))
                .then(() => {
                    return window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
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
        url: 'http://localhost:3000/sesion/logout',
        dataType: 'json',
        async: true,
        success: async(result) => {
            if (result.status === 200) {
                outSession(true)
                $('#load-b').removeClass('hidden fade')
                await eatCookies()
                    .finally(() => {
                        setTimeout(() => {
                            window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
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

function resetPsw() {
    console.log('Reemplazar')
}

function go(where) {
    setCookie('USelected', where)
    window.location.href = String(location.href).slice(0, 21+1)+"encuesta/"
}
