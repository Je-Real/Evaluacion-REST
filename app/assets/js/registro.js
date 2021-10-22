var firstName, lastName,
    area, career, state,
    municipality, street,
    number, postal_code,
    lvl_s = 0

$(document).ready(async() => {
    $('.dep').addClass('d-none') //Hide department options
	$('#department').prop('disabled', true) //Disable dropdown for department

    $('.car').addClass('d-none') //Hide department options
	$('#career').prop('disabled', true) //Disable dropdown for careers

    $('#contract').prop('disabled', true) //Disable dropdown for contracts
    $('#lvl').prop('disabled', true) //Disable dropdown for levels

    levels(0, 0)
})

$('#area').change(() => {
	$('#dep-s').addClass('d-none') //Hide default option
	$('.dep').addClass('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	var affected = $(`.dep[data-area='${parseInt($('#area').val())}']`).removeClass('d-none')

	if (affected.length == 0) {
		//If in the area does not exist any departments
		$('#dep-s').text('N/A').removeClass('d-none').prop('selected', true)
		$('#department').prop('disabled', true)
        levels(0, 0)
	} else {
        //Else 🟢
		$('#dep-s').text('-Selecciona carrera-').removeClass('d-none').prop('selected', true)
		$('#department').prop('disabled', false)
	}

    if(parseInt($('#area').val()) != 0) $('#contract').prop('disabled', false)
    else $('#contract').prop('disabled', true)
    levels(1, $('#area').val())
})

$('#department').change(() => {
	$('#car-s').addClass('d-none') //Hide default option
	$('.car').addClass('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	var affected = $(`.car[data-depa='${parseInt($('#department').val())}']`).removeClass('d-none')

	if (affected.length == 0) {
		//If in the area does not exist any departments
		$('#car-s').text('N/A').removeClass('d-none').prop('selected', true)
		$('#career').prop('disabled', true)
	} else {
		//Else 🟢
		$('#car-s').text('-Selecciona departamento-').removeClass('d-none').prop('selected', true)
		$('#career').prop('disabled', false)
	}
    levels(2, $('#department').val())
})

$('#career').change(() => {
    levels(3, $('#career').val())
})

function levels(lvlShown, val) {
    var lvl_temp = lvl_s 

    if(parseInt(val)===0) {
        lvl_s = (parseInt(lvlShown)<=1) //If the level is less than 1, show nothing
            ? 0 : ((parseInt(lvlShown)===2) //Or else if level is 2, show Director and Subdirector levels
                ? 1 : ((parseInt(lvlShown)===3) //Or else if level is 3, show Docent level
                    ? 2 : ((parseInt(val)>0 && parseInt(lvlShown)!=lvl_s) //If the select isn't empty and level isn't equal as selected
                        ? parseInt(lvlShown) : lvl_s))) //Then set the new value if it's true or else it won't change
    }

    if(lvl_temp != lvl_s) {
        $('#lvl').prop('disabled', false)
        $('.lvl-s').addClass('d-none')
        $('#lvl-s').text('-Selecciona nivel-').prop('selected', true)

        if(lvl_s === 1) {
            $('.lvl-s.lvl-1').removeClass('d-none')
        } else if (lvl_s === 2) {
            $('.lvl-s.lvl-2').removeClass('d-none')
        } else if (lvl_s === 3) {
            $('.lvl-s.lvl-3').removeClass('d-none')
        } else {
            $('#lvl').prop('disabled', true)
            $('#lvl-s').text('N/A').prop('selected', true)
        }
    }
}

function addressGetter() {
    firstName = String($('#first_name').val()).trim()
    lastName = String($('#last_name').val()).trim()
    area = $('#area').val()
    career = $('#career').val()
    state = String($('#state').val()).trim()
    municipality = String($('#municipality').val()).trim()
    street = String($('#street').val()).trim()
    number = String($('#number').val()).trim()
    postal_code = String($('#postal_code').val()).trim()
    
    /*document.getElementById('address').value = 
        String(street+' #'+number+', '+postal_code+', '+municipality+', '+state)*/
    
    console.log(String(street+' #'+number+', '+postal_code+', '+municipality+', '+state))
    
    if( firstName.length && lastName.length && area.length && career.length && state.length &&
        municipality.length && street.length && number.length && postal_code.length) {
            $('#submit').prop('disabled', false)
    }
}

function register() {
    var _id = $('#_id_r').val()
    var fn = $('#first_name').val()
    var ln = $('#last_name').val()
    var area = $('#area').val()
    var dep = $('#department').val()
    var cr = $('#career').val()
    var ct = $('#contract').val()
    var st = $('#street').val()
    var num = $('#num').val()
    var pc = $('#postal_code').val()
    var bday = $('#b_day').val()
    var pass = $('#pass_r').val()

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


/**
 * Hacer funcion AJAX para busqueda automatica de Manager
 * dependiendo el nivel del nuevo usuario
 */