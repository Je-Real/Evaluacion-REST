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

function inSession(setter) {
    var strDrop

    if(setter <= 2) {
        strDrop = '<li><a class="dropdown-item" href="">Perfil</a></li>'+
        '<li><a class="dropdown-item" href="/encuesta/">Encuesta</a></li>'+
        '<li><a class="dropdown-item" href="javascript:toggleRegister()">Nuevo usuario</a></li>'+
        '<li><hr class="dropdown-divider" /></li>'+
        '<li><a class="dropdown-item" href="javascript:logout()">Cerrar sesión</a></li>'
    } else {
        strDrop = '<li><a class="dropdown-item" href="">Perfil</a></li>'+
        '<li><a class="dropdown-item" href="/encuesta/">Encuesta</a></li>'+
        '<li><hr class="dropdown-divider" /></li>'+
        '<li><a class="dropdown-item" href="javascript:logout()">Cerrar sesión</a></li>'
    }

    $('#dropSession').html(
        strDrop
    )
}

function outSession(clicked) {
    $('#dropSession').html(
        '<li>'+
        '<li><a class="dropdown-item" href="javascript:toggleFloating(1)">Iniciar sesión</a></li>'+
        '</li>'
    )
    if(clicked) {
        setTimeout(() => {
            window.location.href = String(location.href).slice(0, 21+1)+"inicio/"
        }, 2500)
    }
}

function toggleFloating(floating) {
    if(tf || floating === 0) {
        frameL.className = frameL.className.replace('d-flex', 'd-none')
        frameP.className = frameP.className.replace('d-flex', 'd-none')
        frameR.className = frameR.className.replace('d-flex', 'd-none')
        backpanel.className = backpanel.className.replace('d-block', 'd-none')
        glass.className = ''
    } else {
        if(floating === 1){
            frameP.className = frameP.className.replace('d-flex', 'd-none')

            frameL.className = frameL.className.replace('d-none', 'd-flex')
            backpanel.className = backpanel.className.replace('d-none', 'd-block')
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
            if(glass.className == 'blur-off'){
                glass.className = glass.className.replace('blur-off', 'blur-on')
            } else {
                glass.className = 'blur-on position-fixed'
            }
            $('#_id_u').focus()
        }
    }
}

function toggleRegister() {
    tr = !tr

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
                showSnack(result.msg)
            } else {
                if(result.status === 200) $('#loginMsg').addClass('text-success')
                $('#loginMsg').addClass('text-danger')
                $('#loginMsg').html(result.msg)
            }

            if(result.status === 200){
                localStorage.setItem('lvl', result.stg.level)
                localStorage.setItem('user', result.stg.user)
                inSession(localStorage.getItem('lvl'))
                toggleFloating(0)
            }
        },
        error: function (xhr, status, error) { 
            showSnack(msg='Status:'+status+'. '+error) //notify
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
                localStorage.clear()
                showSnack('Sesión finalizada')
            } else {
                showSnack(msg='Error: '+result.msg) //notify
            }
        },
        error: function (xhr, status, error) { 
            showSnack(msg='Status:'+status+'. '+error) //notify
        }
    })
}

function password() {
    console.log('Reemplazar')
}

function showSnack(msg, status) {
	$('#noti').html(
		`<div class="mt-5 toast show">
			<div class="toast-header bg-info text-light">
				<strong class="me-auto">Notificación</strong>
				<button type="button" class="btn-close" role="button" data-bs-dismiss="toast" aria-label="Close"></button>
			</div>
			<div class="toast-body">
				${msg}
			</div>
		</div>`
	)
	setTimeout(function () {
		$('#noti').html('')
	}, 3000)
}