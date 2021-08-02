var proceed = document.getElementById('submit')

window.onload = function(){
    proceed.disabled = true
}

function addressGetter() {
    var state = String(document.getElementById('state').value).trim()
    var municipality = String(document.getElementById('municipality').value).trim()
    var street = String(document.getElementById('street').value).trim()
    var number = String(document.getElementById('number').value).trim()
    var number_i = String(document.getElementById('number_i').value).trim()
    var postal_code = String(document.getElementById('postal_code').value).trim()

    if(number_i.length)
        number_i = '(int. '+number_i+')'
    
    document.getElementById('address').value = 
        String(street+' #'+number+' '+number_i+', '+postal_code+', '+municipality+', '+state)
    
    console.log(String(street+' #'+number+' '+number_i+', '+postal_code+', '+municipality+', '+state))
    
    if( state.length && municipality.length && street.length && 
        number.length && postal_code.length) {
            proceed.disabled = false
    }
}