var proceed = document.getElementById('submit')
var firstName, lastName, area, career, state, municipality, street, number, postal_code

window.onload = function(){
    proceed.disabled = true
}

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