var tf = false,
    tr = false,
    frameL = document.getElementById('floatingLogin'),
    frameP = document.getElementById('floatingPass'),
    frameR = document.getElementById('floatingRegister'),
    backpanel = document.getElementById('backPanel'),
    glass = document.getElementById('layoutSidenav')
    
window.addEventListener('DOMContentLoaded', async(event) => {
    if($('#layoutNavbar').attr('data-log') === 'false') {
        showSnack('Iniando sesión...', 'info')
        await getCookie(0)
        .then((data) => {
            if(data.length == 0) return
            cookieData = JSON.parse(data)
            return login(cookieData.user, cookieData.pass)
        })
        .catch((error) => {
            throw console.error('error: ',error)
        })
    }
    
    setTimeout(async () => {
        await $('#load-b').addClass('fade')
        setTimeout(() => {
            $('#load-b').addClass('hidden')
        }, 200)
    }, 200)
    setTimeout(() => {
        $('.deletable').remove() //Remove all the "deletable" elements after 1 sec
    }, 1000)
})

//Capture Enter key in inputs
function onEnterHandler(event) {
    var code = event.which || event.keyCode
    if(code === 13){
      login()
    }
}

function outSession(clicked) {
    if(clicked) {
        setTimeout(() => {
            window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
        }, 2500)
    }
}

function toggleFloating(floating) {
    if(tf || floating === 0) {
        try { frameL.className = frameL.className.replace('d-flex', 'd-none') }
        catch { console.log('No se encontro Frame Login') }
        try { frameP.className = frameP.className.replace('d-flex', 'd-none') }
        catch { console.log('No se encontro Frame Password') }
        try {
            backpanel.className = backpanel.className.replace('blur-on', 'blur-off')
            backpanel.className = backpanel.className.replace('d-block', 'd-none')
        }
        catch { console.log('No se encontro Background Panel') }
        glass.className = ''
    } else {
        if(floating === 1){
            frameP.className = frameP.className.replace('d-flex', 'd-none')
            frameL.className = frameL.className.replace('d-none', 'd-flex')
            backpanel.className = backpanel.className.replace('d-none', 'd-block')
            backpanel.className = backpanel.className.replace('blur-off', 'blur-on')

            if(glass.className == 'blur-off'){
                glass.className = glass.className.replace('blur-off', 'blur-on')
            } else {
                glass.className = 'blur-on position-fixed'
            }
            $('#_id').focus()
        } else {
            frameL.className = frameL.className.replace('d-flex', 'd-none')
            frameP.className = frameP.className.replace('d-none', 'd-flex')
            backpanel.className = backpanel.className.replace('d-none', 'd-block')
            backpanel.className = backpanel.className.replace('blur-off', 'blur-on')

            if(glass.className == 'blur-off'){
                glass.className = glass.className.replace('blur-off', 'blur-on')
            } else {
                glass.className = 'blur-on position-fixed'
            }
            $('#_id_u').focus()
        }
    }
}

function login(i, p) {
    i = (i) ? i : (($('#_id').val()) ? $('#_id').val() : undefined)
    p = (p) ? p : (($('#pass').val()) ? $('#pass').val() : undefined)

    console.log('--'+i+' '+p);

    if(i === undefined) return console.error('login failed!')

    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/sesion/login',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ _id: i, pass: p }),
        dataType: 'json',
        async: true,
        success: async(result) => {
            $('#load-b').removeClass('hidden')
            $('#load-b').removeClass('fade')

            if(result.noti){
                showSnack(result.msg, 'success')
            } else {
                $('#loginMsg').addClass('text-danger')
                $('#loginMsg').html(result.msg)
            }

            if(result.status === 200){
                toggleFloating(0)
                result.data.pass = p
                await setCookie(result.data.user, JSON.stringify(result.data))
                    .then(() => {
                        return window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
                    })
                    .catch((error) => {
                        showSnack('Status: Cookies error')
                    })
            }
        },
        error: function (xhr, status, error) { 
            showSnack('Status:'+status+'. '+error, 'error')
        }
    })
}

function logout() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/sesion/logout',
        dataType: 'json',
        async: true,
        success: async (result) => {
            if(result.status === 200){
                outSession(true)
                $('#load-b').removeClass('hidden')
                $('#load-b').removeClass('fade')
                await eatCookies()
                    .finally(() => {
                        setTimeout(() => {
                            window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
                        }, 500)
                    })
            } else {
                showSnack('Error: '+result.msg, 'error')
            }
        },
        error: function (xhr, status, error) { 
            showSnack('Status:'+status+'. '+error, 'error')
        }
    })
}

function password() {
    console.log('Reemplazar')
}

function showSnack(msg, status) {
    var bgColor
    var id = Math.random().toString(16).substr(2, 8)

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

	setTimeout(function() {
        hideSnack(id)
	}, 3000)
}

function hideSnack(id) {
    $(`#${id}`).removeClass('animate__fadeIn')
    $(`#${id}`).addClass('animate__fadeOut')
	setTimeout(function() {
        $(`#${id}`).remove()
    }, 1000)
}