let firstName, lastName,
    area, career, state,
    municipality, street,
    number, postal_code,
    aa = null, dd = 0, cc = 0,
    lvl_s = 0

window.addEventListener('load', async(e) => {
    $('.dep').addClass('d-none') //Hide department options
	$e('#department').prop('disabled', true) //Disable dropdown for department

    $('.car').addClass('d-none') //Hide department options
	$e('#career').prop('disabled', true) //Disable dropdown for careers

    $e('#contract').prop('disabled', true) //Disable dropdown for contracts
    $e('#lvl').prop('disabled', true) //Disable dropdown for levels

    eventAssigner('#submit', 'click', register).catch((error) => {return console.error(error)})

    levels(0, 0)
})

$e('#area').change(() => {
    $e('#dep-s').addClass('d-none') //Hide default option
	$('.dep').addClass('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	let affected = $(`.dep[data-area='${parseInt($e('#area').value)}']`).removeClass('d-none')

	if(affected.length == 0) {
		//If in the area does not exist any departments
		$e('#dep-s').text('N/A').removeClass('d-none').prop('selected', true)
		$e('#department').prop('disabled', true)
        levels(0, 0)
	} else {
        //Else 🟢
		$e('#dep-s').text('-Selecciona carrera-').removeClass('d-none').prop('selected', true)
		$e('#department').prop('disabled', false)
	}

    if(parseInt($e('#area').value) != 0) {
        $e('#contract').prop('disabled', false)
        $e('#ct-s').text('-Selecciona carrera-')
    }
    else {
        $e('#contract').prop('disabled', true)
        $e('#ct-s').text('N/A')
    }
    levels(1, $e('#area').value)
})

$e('#department').change(() => {
	$e('#car-s').addClass('d-none') //Hide default option
	$('.car').addClass('d-none') ////Hide again all department options

	//And show all departments the ones that match with the area selected
	let affected = $(`.car[data-depa='${parseInt($e('#department').value)}']`).removeClass('d-none')

	if(affected.length == 0) {
		//If in the area does not exist any departments
		$e('#car-s').text('N/A').removeClass('d-none').prop('selected', true)
		$e('#career').prop('disabled', true)
	} else {
		//Else 🟢
		$e('#car-s').text('-Selecciona departamento-').removeClass('d-none').prop('selected', true)
		$e('#career').prop('disabled', false)
	}
    levels(2, $e('#department').value)
})

$e('#career').change(() => {
    levels(3, $e('#career').value)
})

$e('#area, #department, #career').change(() => {
    if(aa === null) {
        aa = $e('#area').value
        dd = $e('#department').value
        cc = $e('#career').value
        return
    }
    if(aa != $e('#area').value || dd != $e('#department').value || cc != $e('#career').value) {
        aa = $e('#area').value
        dd = $e('#department').value
        cc = $e('#career').value

        getManager(false)
    }
})

$e('#lvl').change(() => {
    getManager($e('#lvl').value)
})

function levels(lvlShown, val) {
    let lvl_temp = lvl_s

    lvl_s = (parseInt(val)===0 && parseInt(lvlShown)<=1) //If the level is less than 1, show nothing
        ? 0 : ((parseInt(val)===0 && parseInt(lvlShown)===2) //Or else if level is 2, show Director and Subdirector levels
            ? 1 : ((parseInt(val)===0 && parseInt(lvlShown)===3) //Or else if level is 3, show Docent level
                ? 2 : ((parseInt(val)>0 && parseInt(lvlShown)!=lvl_s) //If the select isn't empty and level isn't equal as selected
                    ? parseInt(lvlShown) : lvl_s))) //Then set the new value if it's true or else it won't change

    if(lvl_temp != lvl_s) {
        $e('#lvl').prop('disabled', false)
        $('.lvl-s').addClass('d-none')
        $e('#lvl-s').text('-Selecciona nivel-').prop('selected', true)

        if(lvl_s === 1) {
            $('.lvl-s.lvl-1').removeClass('d-none')
        } else if(lvl_s === 2) {
            $('.lvl-s.lvl-2').removeClass('d-none')
        } else if(lvl_s === 3) {
            $('.lvl-s.lvl-3').removeClass('d-none')
        } else {
            $e('#lvl').prop('disabled', true)
            $e('#lvl-s').text('N/A').prop('selected', true)
        }
    }
}

function addressGetter() {
    firstName = String($e('#first_name').value).trim()
    lastName = String($e('#last_name').value).trim()
    area = $e('#area').value
    career = $e('#career').value
    state = String($e('#state').value).trim()
    municipality = String($e('#municipality').value).trim()
    street = String($e('#street').value).trim()
    number = String($e('#number').value).trim()
    postal_code = String($e('#postal_code').value).trim()
    
    /*document.getElementById('address').value = 
        String(street+' #'+number+', '+postal_code+', '+municipality+', '+state)*/
    
    if( firstName.length && lastName.length && area.length && career.length && state.length &&
        municipality.length && street.length && number.length && postal_code.length) {
            $e('#submit').prop('disabled', false)
    }
}

const register = async() => {
    let packed = JSON.stringify({ 
        _id: $e('#_id_r').value, 
        pass: $e('#pass_r').value,
        first_name: $e('#first_name').value,
        last_name: $e('#last_name').value,
        area: $e('#area').value,
        department: $e('#department').value,
        career: $e('#career').value,
        contract: $e('#contract').value,
        street: $e('#street').value,
        num: $e('#num').value,
        postal_code: $e('#postal_code').value,
        b_day: $e('#b_day').value
    })

    await $.ajax({
        type: 'POST',
        url: 'http://localhost:999/sesion/nuevo-usuario',
        contentType: 'application/json; charset=utf-8',
        data: packed,
        dataType: 'json',
        async: true,
        success: (result) => {
            showSnack(
                result.msg,
                null, SNACK.success
            )

            if(result.status === 200) {
                document.getElementById("f-reg").reset()
            }
        },
        error: (xhr, status, error) => {
            showSnack(
                'Status: '+status+'. '+error,
                null, SNACK.error
            )
        }
    })
}

function getManager(lvl_sel) {
    $('.mgr-s').remove()
    if(lvl_sel === false) {
        $("#manager").prop('disabled', true)
        $e('#mgr-s').removeClass('d-none').prop('selected', true)
        $e('#lvl-s').prop('selected', true)
        return
    }

    let packed = {
        area: parseInt($e('#area').value),
        department: parseInt($e('#department').value),
        career: parseInt($e('#career').value),
        level: parseInt(lvl_sel)
    }

    $.ajax({
        type: 'GET',
        url: 'http://localhost:999/registro/manager',
        contentType: 'application/json; charset=utf-8',
        data: packed,
        dataType: 'json',
        async: true,
        success: (result) => {
            if(result.status === 200) {
                if(result.data.length > 0) {

                    for(info in result.data) {
                        $("#manager").append(
                            `<option class="mgr-s mgr-${info}" value="${info+1}">
                            ${(result.data[info].first_name).split(" ")[0]} 
                            ${(result.data[info].last_name)}
                            </option>`
                        )
                    }
                    $e('#mgr-s').addClass('d-none')
                    $('.mgr-s.mgr-0').prop('selected', true)
    
                    $("#manager").prop('disabled', false)
                } else {
                    $("#manager").prop('disabled', true)
                    $e('#mgr-s').text('N/A').removeClass('d-none').prop('selected', true)
                    showSnack(
                        (lang == 0) ? 'No se encontró manager. <br/>Error del servidor.'
                                    : 'No manager found. <br/> Server error.',
                        null, SNACK.error
                    )
                }
            }
        },
        error: (xhr, status, error) => {
            showSnack(
                'Status: '+status+'. '+error,
                null, SNACK.error
            )
        }
    })
}