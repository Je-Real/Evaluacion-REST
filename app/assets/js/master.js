var tf = false
var tr = false
var frameL = document.getElementById('floatingLogin')
var frameP = document.getElementById('floatingPass')
var frameR = document.getElementById('floatingRegister')
var backpanel = document.getElementById('backPanel')
var glass = document.getElementById('layoutSidenav')

function init() {
    if(localStorage.getItem('user') != null) inSession(localStorage.getItem('lvl'))
    else outSession()
}

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
        try { frameR.className = frameR.className.replace('d-flex', 'd-none') }
        catch { console.log('No se encontro Frame Registro') }
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

function toggleRegister(show) {
    if(show === 1) tr = show
    else tr = !tr

    if(tr) {
        frameR.className = frameR.className.replace('d-none', 'd-flex')
        backpanel.className = backpanel.className.replace('d-none', 'd-block')
        if(glass.className == 'blur-off'){
            glass.className = glass.className.replace('blur-off', 'blur-on')
        } else {
            glass.className = 'blur-on position-fixed'
        }
        $('#first_name').focus()
    } else {
        frameR.className = frameR.className.replace('d-flex', 'd-none')
        backpanel.className = backpanel.className.replace('d-block', 'd-none')
        glass.className = ''
    }

}

function login() {
    var i = document.getElementById('_id').value
    var p = document.getElementById('pass').value

    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/sesion/login',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ _id: i, pass: p }),
        dataType: 'json',
        async: true,
        success: function(result){
            if(result.noti){
                showSnack(result.msg, 'success')
            } else {
                $('#loginMsg').addClass('text-danger')
                $('#loginMsg').html(result.msg)
            }

            if(result.status === 200){
                toggleFloating(0)
                setTimeout(() => {
                    window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
                }, 3500)
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
        success: function(result){
            if(result.status === 200){
                outSession(true)
                showSnack('Sesión finalizada', 'success')
            } else {
                showSnack('Error: '+result.msg, 'error')
            }
        },
        error: function (xhr, status, error) { 
            showSnack('Status:'+status+'. '+error, 'error')
        }
    })
}

function register() {
    var _id = document.getElementById('_id_r').value
    var fn = document.getElementById('first_name').value
    var ln = document.getElementById('last_name').value
    var area = document.getElementById('area').value
    var dep = document.getElementById('department').value
    var cr = document.getElementById('career').value
    var ct = document.getElementById('contract').value
    var st = document.getElementById('street').value
    var num = document.getElementById('num').value
    var pc = document.getElementById('postal_code').value
    var bday = document.getElementById('b_day').value
    var pass = document.getElementById('pass_r').value

    var packed = JSON.stringify({ 
        _id: _id, 
        pass: pass,
        first_name: fn,
        last_name: ln,
        area: area,
        department: dep,
        career: cr,
        contract: ct,
        street: st,
        num: num,
        postal_code: pc,
        b_day: bday
    })

    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/sesion/nuevo-usuario',
        contentType: 'application/json; charset=utf-8',
        data: packed,
        dataType: 'json',
        async: true,
        success: function(result){
            showSnack(result.msg, 'success')

            if(result.status === 200){
                toggleFloating(0)
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
        `<div class="row">
            <div id="${id}" class="animate__animated p-0 my-1 toast show">
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