var proceed = document.getElementById('submit')
var firstName, lastName, area, career, state, municipality, street, number, postal_code

window.addEventListener('DOMContentLoaded', event => {
    proceed.disabled = true
})

function addressGetter() {
    firstName = String(document.getElementById('first_name').value).trim()
    lastName = String(document.getElementById('last_name').value).trim()
    area = document.getElementById('area').value
    career = document.getElementById('career').value
    state = String(document.getElementById('state').value).trim()
    municipality = String(document.getElementById('municipality').value).trim()
    street = String(document.getElementById('street').value).trim()
    number = String(document.getElementById('number').value).trim()
    postal_code = String(document.getElementById('postal_code').value).trim()
    
    /*document.getElementById('address').value = 
        String(street+' #'+number+', '+postal_code+', '+municipality+', '+state)*/
    
    console.log(String(street+' #'+number+', '+postal_code+', '+municipality+', '+state))
    
    if( firstName.length && lastName.length && area.length && career.length && state.length &&
        municipality.length && street.length && number.length && postal_code.length) {
            proceed.disabled = false
    }
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
                document.getElementById("f-reg").reset()
            }
        },
        error: function (xhr, status, error) {
            showSnack('Status:'+status+'. '+error, 'error')
        }
    })
}