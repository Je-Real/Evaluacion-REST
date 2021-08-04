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
            console.log(result);
            if(result.status == 200){
                toggleLogin()
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
        success: function(msg){
            switch (msg) {
                case 0:
                    console.log('Cerrando sesión')
                    break
                case 1:
                    console.log('No se pudo encontrar usuario')
                    break
                case 2:
                    console.log('Error de sistema :(')
                    break
            
                default:
                    console.log('Golazooooo!')
                    break
            }
            location.reload()
        },
        error: function (xhr, status, error) { console.log('Status:'+status+'. '+error) }
    })
}