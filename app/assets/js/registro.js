var firstName, lastName,
    area, career, state,
    municipality, street,
    number, postal_code,
    a = null, d = 0, c = 0,
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

	if(affected.length == 0) {
		//If in the area does not exist any departments
		$('#dep-s').text('N/A').removeClass('d-none').prop('selected', true)
		$('#department').prop('disabled', true)
        levels(0, 0)
	} else {
        //Else 🟢
		$('#dep-s').text('-Selecciona carrera-').removeClass('d-none').prop('selected', true)
		$('#department').prop('disabled', false)
	}

    if(parseInt($('#area').val()) != 0) {
        $('#contract').prop('disabled', false)
        $('#ct-s').text('-Selecciona carrera-')
    }
    else {
        $('#contract').prop('disabled', true)
        $('#ct-s').text('N/A')
    }
    levels(1, $('#area').val())
})

$('#department').change(() => {
	$('#car-s').addClass('d-none') //Hide default option
	$('.car').addClass('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	var affected = $(`.car[data-depa='${parseInt($('#department').val())}']`).removeClass('d-none')

	if(affected.length == 0) {
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

$('#area, #department, #career').change(() => {
    if(a === null){
        a = $('#area').val()
        d = $('#department').val()
        c = $('#career').val()
        return
    }
    if(a != $('#area').val() || d != $('#department').val() || c != $('#career').val()){
        a = $('#area').val()
        d = $('#department').val()
        c = $('#career').val()

        getManager(false)
    }
})

$('#lvl').change(() => {
    getManager($('#lvl').val())
})

function levels(lvlShown, val) {
    var lvl_temp = lvl_s

    lvl_s = (parseInt(val)===0 && parseInt(lvlShown)<=1) //If the level is less than 1, show nothing
        ? 0 : ((parseInt(val)===0 && parseInt(lvlShown)===2) //Or else if level is 2, show Director and Subdirector levels
            ? 1 : ((parseInt(val)===0 && parseInt(lvlShown)===3) //Or else if level is 3, show Docent level
                ? 2 : ((parseInt(val)>0 && parseInt(lvlShown)!=lvl_s) //If the select isn't empty and level isn't equal as selected
                    ? parseInt(lvlShown) : lvl_s))) //Then set the new value if it's true or else it won't change

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
    
    if( firstName.length && lastName.length && area.length && career.length && state.length &&
        municipality.length && street.length && number.length && postal_code.length) {
            $('#submit').prop('disabled', false)
    }
}

async function register() {
    var packed = JSON.stringify({ 
        _id: $('#_id_r').val(), 
        pass: $('#pass_r').val(),
        first_name: $('#first_name').val(),
        last_name: $('#last_name').val(),
        area: $('#area').val(),
        department: $('#department').val(),
        career: $('#career').val(),
        contract: $('#contract').val(),
        street: $('#street').val(),
        num: $('#num').val(),
        postal_code: $('#postal_code').val(),
        b_day: $('#b_day').val()
    })

    await $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/sesion/nuevo-usuario',
        contentType: 'application/json; charset=utf-8',
        data: packed,
        dataType: 'json',
        async: true,
        success: (result) => {
            showSnack(result.msg, 'success')

            if(result.status === 200){
                document.getElementById("f-reg").reset()
            }
        },
        error: (xhr, status, error) => {
            showSnack('Status: '+status+'. '+error, 'error')
        }
    })
}

function getManager(lvl_sel) {
    $('.mgr-s').remove()
    if(lvl_sel === false) {
        $("#manager").prop('disabled', true)
        $('#mgr-s').removeClass('d-none').prop('selected', true)
        $('#lvl-s').prop('selected', true)
        return
    }

    var packed = {
        area: parseInt($('#area').val()),
        department: parseInt($('#department').val()),
        career: parseInt($('#career').val()),
        level: parseInt(lvl_sel)
    }

    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/registro/manager',
        contentType: 'application/json; charset=utf-8',
        data: packed,
        dataType: 'json',
        async: true,
        success: (result) => {
            if(result.status === 200){
                if(result.data.length > 0){

                    for(info in result.data) {
                        $("#manager").append(
                            `<option class="mgr-s mgr-${info}" value="${info+1}">
                            ${(result.data[info].first_name).split(" ")[0]} 
                            ${(result.data[info].last_name)}
                            </option>`
                        )
                    }
                    $('#mgr-s').addClass('d-none')
                    $('.mgr-s.mgr-0').prop('selected', true)
    
                    $("#manager").prop('disabled', false)
                } else {
                    $("#manager").prop('disabled', true)
                    $('#mgr-s').text('N/A').removeClass('d-none').prop('selected', true)
                    showSnack('No se encontro manager.\r\nError del servidor.', 'error')
                }
            }
        },
        error: (xhr, status, error) => {
            showSnack('Status: '+status+'. '+error, 'error')
        }
    })
}