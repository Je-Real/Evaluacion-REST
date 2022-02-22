let firstName, lastName,
    area, career, state,
    municipality, street,
    number, postal_code,
    aa = null, dd = 0, cc = 0,
    lvl_s = 0

let careerOptDef, careerOptions,
    departmentOptDef, departmentOptions,
    contractSelect

window.addEventListener('load', async(e) => {
    departmentOptDef = $e('#dep-s')
    departmentOptions = $a('.dep')
    
    careerOptDef = $e('#car-s')
    careerOptions = $a('.car')

    contractSelect = $e('#contract')

    departmentOptions.forEach(node => node.classList.add('d-none')) //Hide department options
	$e('#department').disabled = true //Disable dropdown for department

    careerOptions.forEach(node => node.classList.add('d-none')) //Hide department options
	$e('#career').disabled = true //Disable dropdown for careers

    contractSelect.disabled = true //Disable dropdown for contracts
    $e('#lvl').disabled = true //Disable dropdown for levels

    eventAssigner('#submit', 'click', register).catch((error) => {return console.error(error)})
    
    levels(0, 0)

    eventAssigner('#area', 'change', () => {
        departmentOptDef.classList.add('d-none') //Hide default option
        departmentOptions.forEach(node => node.classList.add('d-none')) ////Hide again all department options
    
        //And show all departments the ones that match with the area selected
        let affected = $a(`.dep[data-area='${parseInt($e('#area')[$e('#area').selectedIndex].value)}']`)
    
        if(affected.length == 0) {
            //If in the area does not exist any departments
            departmentOptDef.innerHTML = 'N/A'
            departmentOptDef.classList.remove('d-none')
            departmentOptDef.selected = true
            $e('#department').disabled = true
            levels(0, 0)
        } else {
            //Else 🟢
            departmentOptDef.innerHTML = (lang == 0) ? '-Selecciona carrera-' : '-Select career-'
            departmentOptDef.classList.remove('d-none')
            departmentOptDef.selected = true
            $e('#department').disabled = false
    
            affected.forEach(node => node.classList.remove('d-none'))
        }
    
        if(parseInt($e('#area')[$e('#area').selectedIndex].value) != 0) {
            contractSelect.disabled = false
            $e('#ct-s').innerHTML = (lang == 0) ? '-Selecciona carrera-' : '-Select career-'
        }
        else {
            contractSelect.disabled = true
            $e('#ct-s').innerHTML = 'N/A'
        }
        levels(1, $e('#area')[$e('#area').selectedIndex].value)
    })

    eventAssigner('#department', 'change', () => {
        let careerOptDef = $e('#car-s')

        careerOptDef.classList.add('d-none') //Hide default option
        careerOptions.forEach(node => node.classList.add('d-none')) ////Hide again all department options
    
        //And show all departments the ones that match with the area selected
        let affected = $a(`.car[data-depa='${parseInt($e('#department')[$e('#department').selectedIndex].value)}']`)
    
        if(affected.length == 0) {
            //If in the area does not exist any departments
            careerOptDef.innerHTML = 'N/A'
            careerOptDef.classList.remove('d-none')
            careerOptDef.selected = true
            $e('#career').disabled = true
        } else {
            //Else 🟢
            careerOptDef.innerHTML = '-Selecciona departamento-'
            careerOptDef.classList.remove('d-none')
            careerOptDef.selected = true
            $e('#career').disabled = false
            affected.forEach(node => node.classList.remove('d-none'))
        }
        levels(2, $e('#department')[$e('#department').selectedIndex].value)
    })

    eventAssigner('#career', 'change', () => {
        levels(3, $e('#career')[$e('#career').selectedIndex].value)
    })

    /*setTimeout(async() => {
        $a('input[type="text"], input[type="password"]').forEach(node => {
            node.value = ''
        })
    }, 500)*/
})

eventAssigner('#area, #department, #career', 'change', () => {
    if(aa != null)
        if(aa != $e('#area')[$e('#area').selectedIndex].value
            || dd != $e('#department')[$e('#department').selectedIndex].value
            || cc != $e('#career')[$e('#career').selectedIndex].value
        ) {
            aa = $e('#area')[$e('#area').selectedIndex].value
            dd = $e('#department')[$e('#department').selectedIndex].value
            cc = $e('#career')[$e('#career').selectedIndex].value
            getManager(false)
        }
})

eventAssigner('#lvl', 'change', () => {
    getManager($e('#lvl')[$e('#lvl').selectedIndex].value)
})

function levels(lvlShown, val) {
    let lvl_temp = lvl_s

    lvl_s = (parseInt(val)===0 && parseInt(lvlShown)<=1) //If the level is less than 1, show nothing
        ? 0 : ((parseInt(val)===0 && parseInt(lvlShown)===2) //Or else if level is 2, show Director and Subdirector levels
            ? 1 : ((parseInt(val)===0 && parseInt(lvlShown)===3) //Or else if level is 3, show Docent level
                ? 2 : ((parseInt(val)>0 && parseInt(lvlShown)!=lvl_s) //If the select isn't empty and level isn't equal as selected
                    ? parseInt(lvlShown) : lvl_s))) //Then set the new value if it's true or else it won't change

    if(lvl_temp != lvl_s) {
        $e('#lvl').disabled = false
        $a('.lvl-s').forEach(node => node.classList.add('d-none'))
        $e('#lvl-s').innerHTML = (lang == 0) ? '-Selecciona nivel-' : '-Select level-'
        $e('#lvl-s').selected = true

        if(lvl_s === 1) {
            $a('.lvl-s.lvl-1').forEach(node => {
                node.classList.remove('d-none')
            })
        } else if(lvl_s === 2) {
            $a('.lvl-s.lvl-2').forEach(node => {
                node.classList.remove('d-none')
            })
        } else if(lvl_s === 3) {
            $a('.lvl-s.lvl-3').forEach(node => {
                node.classList.remove('d-none')
            })
        } else {
            $e('#lvl').disabled = true
            $e('#lvl-s').innerHTML = 'N/A'
            $e('#lvl-s').selected = true
        }
    }
}

function addressGetter() {
    firstName = String($e('#first_name').value).trim()
    lastName = String($e('#last_name').value).trim()
    area = $e('#area')[$e('#area').selectedIndex].value
    department = $e('#department')[$e('#department').selectedIndex].value
    career = $e('#career')[$e('#career').selectedIndex].value
    state = String($e('#state').value).trim()
    municipality = String($e('#municipality').value).trim()
    street = String($e('#street').value).trim()
    number = String($e('#number').value).trim()
    postal_code = String($e('#postal_code').value).trim()
    
    /*document.getElementById('address').value = 
        String(street+' #'+number+', '+postal_code+', '+municipality+', '+state)*/
    
    if( firstName.length && lastName.length && area.length && career.length && state.length &&
        municipality.length && street.length && number.length && postal_code.length) {
            $e('#submit').disabled = false
    }
}

const register = async() => {
    let package = { 
        _id: $e('#new_id').value,
        pass: $e('#new_pass').value,
        first_name: String($e('#first_name').value).trim(),
        last_name: String($e('#last_name').value).trim(),
        area: $e('#area')[$e('#area').selectedIndex].value,
        department: $e('#department')[$e('#department').selectedIndex].value,
        career: $e('#career')[$e('#career').selectedIndex].value,
        contract: contractSelect[contractSelect.selectedIndex].value,
        street: String($e('#street').value).trim(),
        num: String($e('#num').value).trim(),
        postal_code: String($e('#postal_code').value).trim(),
        b_day: $e('#b_day').value
    }

    await fetchTo(
        'http://localhost:999/session/sign-in',
        'POST',
        package,
        (result) => {
            showSnack(result.msg, null, SNACK.success)
            if(result.status === 200) $e('#f-reg').reset()
        },
        (error) => {
            showSnack('Error '+error, null, SNACK.error)
            console.error(error)
        }
    )
}

function getManager(lvl_sel) {
    $a('.mgr-s').forEach(node => node.remove())
    if(lvl_sel === false) {
        $e('#manager').disabled = true
        $e('#mgr-s').className.remove('d-none')
        $e('#mgr-s').selected = true
        $e('#lvl-s').selected = true
        return
    }

    let package = {
        area: $e('#area')[$e('#area').selectedIndex].value,
        department: $e('#department')[$e('#department').selectedIndex].value,
        career: $e('#career')[$e('#career').selectedIndex].value,
        level: parseInt(lvl_sel)
    }

    fetchTo(
        'http://localhost:999/register/manager',
        'GET',
        package,
        (result) => {
            if(result.status === 200) {
                if(result.data.length > 0) {

                    for(info in result.data) {
                        $e('#manager').insertAdjacentHTML('beforeend',
                            `<option class='mgr-s mgr-${info}' value='${info+1}'>
                            ${(result.data[info].first_name).split(' ')[0]} 
                            ${(result.data[info].last_name)}
                            </option>`
                        )
                    }
                    $e('#mgr-s').classList.add('d-none')
                    $a('.mgr-s.mgr-0').forEach(node => node.selected = true)
    
                    $e('#manager').disabled = false
                } else {
                    $e('#manager').disabled = true
                    $e('#mgr-s').innerHTML = 'N/A'
                    $e('#mgr-s').classList.remove('d-none')
                    $e('#mgr-s').selected = true
                    showSnack(
                        (lang == 0) ? 'No se encontró manager. <br/>Error del servidor.'
                                    : 'No manager found. <br/> Server error.',
                        null, SNACK.error
                    )
                }
            }
        },
        (error, result) => {
            showSnack(
                'Status: '+result+'. '+error,
                null, SNACK.error
            )
            console.error(error)
        }
    )
}