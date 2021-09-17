var tf = false
var tr = false
var frameL = document.getElementById('floatingLogin')
var frameP = document.getElementById('floatingPass')
var frameR = document.getElementById('floatingRegister')
var backpanel = document.getElementById('backPanel')
var glass = document.getElementById('layoutSidenav')

window.addEventListener('DOMContentLoaded', event => {
    setTimeout(() => {
        $('#load-b').fadeOut(200);
        setTimeout(() => {
            $('#load-b').remove()
        }, 100)
    }, 200)
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
                showSnack(result.msg, 'success')
                setTimeout(() => {
                    window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
                }, 3500)
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