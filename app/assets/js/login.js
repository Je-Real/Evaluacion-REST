var toggler = false
var frame = document.getElementById('floatingLogin')
var backpanel = document.getElementById('backPanel')
var glass = document.getElementById('layoutSidenav')

function toggleLogin() {
    if(toggler){
        frame.className = frame.className.replace('d-flex', 'd-none')
        backpanel.className = backpanel.className.replace('d-block', 'd-none')
        glass.className = ''
        console.log('Off')
    }
    else{
        frame.className = frame.className.replace('d-none', 'd-flex')
        backpanel.className = backpanel.className.replace('d-none', 'd-block')
        if(glass.className == 'blur-off'){
            glass.className = glass.className.replace('blur-off', 'blur-on')
        } else {
            glass.className = 'blur-on position-fixed'
        }
        $('#_id').focus()
        console.log('On')
    }

    toggler = !toggler
}

function onEnterHandler(event) {
    var code = event.which || event.keyCode     
    if(code === 13){
      login()
    }
}

function test() {
    const xhttp = new XMLHttpRequest()
    xhttp.onload = function() {
        document.getElementById('test').innerHTML = this.responseText
    }
    xhttp.open('GET', 'http://localhost:3000/inicio/test', true)
    xhttp.send()
}

function login() {
    console.log('--')
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
                $('#loginMsg').html('Notify: '+result.msg)
            } else {
                if(result.status === 200) $('#loginMsg').addClass('text-success')
                $('#loginMsg').addClass('text-danger')
                $('#loginMsg').html(result.msg)
            }

            if(result.status === 200){
                $('#dropSession').html('<li><a class="dropdown-item" href="!">Perfil</a></li>'+
                '<li><hr class="dropdown-divider" /></li><li>'+
                '<button class="btn dropdown-item" onclick="logout()">Cerrar sesión</button></li>')

                setTimeout(function () {
                    toggleLogin()
                }, 5000)
            }
        },
        error: function (xhr, status, error) { console.log('Status:'+status+'. '+error) }
    })
}

function logout() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/sesion/logout',
        async: true,
        success: function(result){
            if(result.status === 200){
                $('#test').html('<li><a class="dropdown-item" href="!">Perfil</a></li>'+
                '<li><hr class="dropdown-divider" /></li><li>'+
                '<button class="btn dropdown-item" onclick="logout()">Cerrar sesión</button></li>')

                setTimeout(function () {
                    toggleLogin()
                }, 5000)
            }
            location.reload()
        },
        error: function (xhr, status, error) { console.log('Status:'+status+'. '+error) }
    })
}