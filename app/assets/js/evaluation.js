window.addEventListener('load', async(e) => {
    let radioFields = { length: 0 },
        activeSec_5 = [0, 4], // 0 filled (initialized) out of 4 radio buttons in total inside 5th section
        activeSec_6 = [0, 2], // 0 filled (initialized) out of 2 radio buttons in total inside 6th section
        activeSec_7 = [0, 4] // and so on...

    $e('#btn-send').disabled = true

    const inputClick = (e) => {
        let tgt = e.target

        
        radioFields[tgt.name] = parseInt(tgt.value)
        radioFields.length++

        if(parseInt(tgt.name.split('_')[1]) > 0 && parseInt(tgt.name.split('_')[1]) <= 4)
            $e('#P-'+tgt.name.split('_')[1]).classList.replace('deactivated', 'activated')
        else {
            switch (parseInt(tgt.name.split('_')[1])) {
                case 5:
                    activeSec_5[0]++
                    break
                case 6:
                    activeSec_5[0]++
                    break
                case 7:
                    activeSec_5[0]++
                    break
                case 8:
                    activeSec_5[0]++
                    break
                
                case 9:
                    activeSec_6[0]++
                    break
                case 10:
                    activeSec_6[0]++
                    break
                
                case 11:
                    activeSec_7[0]++
                    break
                case 12:
                    activeSec_7[0]++
                    break
                case 13:
                    activeSec_7[0]++
                    break
                case 14:
                    activeSec_7[0]++
                    break
            
                default:
                    console.error('Not found a value for the following element:')
                    console.error(tgt)
                    break;
            }
        }

        if(activeSec_5[0] === activeSec_5[1]) $e('#P-5').classList.replace('deactivated', 'activated')
        if(activeSec_6[0] === activeSec_6[1]) $e('#P-6').classList.replace('deactivated', 'activated')
        if(activeSec_7[0] === activeSec_7[1]) $e('#P-7').classList.replace('deactivated', 'activated')

        if(radioFields.length === 14) $e('#btn-send').disabled = false
    }

    const slctOjb = () => selectObjective(true)
    
    if(localStorage.getItem('paginator-card-view') === 'true') cardView()
    else listView()
    
    await getCookie('USelected')
    .then((data) => {
        if(data.length) {
            selectObjective(data)
            setCookie('USelected', '')
        }
    })
    .catch((error) => {
        log('[Survey] Error user selected!: '+error, STYLE.pink)
    })
    
    eventAssigner('.card.card-option', 'click', slctOjb)
    eventAssigner('input[type="radio"]', 'click', inputClick)

    eventAssigner('#btn-send', 'click', () => {
        let id
        delete radioFields.length

        if(String($e('#userObj').value).length <= 0)
            return showSnack(
                (lang == 0) ? 'Debes seleccionar a alguien para evaluar'
                            : 'You must select someone to evaluate',
                null, SNACK.warning
            )
        else id = $e('#userObj').value

        for(let score in radioFields) {
            if(radioFields[score] == undefined || radioFields[score] == null || radioFields[score] == 0) {
                console.log(radioFields[score])
                return showSnack(
                    (lang == 0) ? '¡Aun no se puede enviar!<br/>Debes completar la evaluación! Falta '+score
                                : 'Cannot be sent yet!<br/>You must complete the evaluation. Remain '+score,
                    null, SNACK.warning
                )
            }
        }
    
        let pkg = {
            _id: id,
            records: radioFields
        }
        
        fetchTo(
            'http://localhost:999/evaluation',
            'POST',
            pkg,
            (result) => {
                if(result.noti && result.status === 200) {
                    showSnack(result.msg, null, SNACK.success)
                    setTimeout(window.location.reload(false), 1500)

                    /**TODO: If page without reloading */
                    radioFields = { length: 0 }
                    activeSec_5 = [0, 4]
                    activeSec_6 = [0, 2]
                    activeSec_7 = [0, 4]
                }
                else showSnack(result.msg, null, SNACK.error)
            },
            (error) => showSnack(`Error: ${error}`, null, SNACK.error)
        )
    })
})

function listView() {
    $a('.card.card-option').forEach(node => {
        node.classList.remove('w-md-25', 'mb-4')
        node.classList.add('w-100', 'w-lg-75', 'mb-2')
    })
    $a('.mode').forEach(node => {
        node.classList.remove('card-mode')
        node.classList.add('list-mode')
    })
    $a('.card-body').forEach(node => {
        node.classList.add('pt-1', 'pb-2')
    })
    $a('.card-body>.row').forEach(node => {
        node.classList.remove('text-center')
    })
    $a('.items.row div').forEach(node => {
        node.classList.remove('col-12')
        node.classList.add('col-md', 'col-6')
    })

    $e('#card').classList.replace('btn-on', 'btn-secondary')
    $e('#list').classList.replace('btn-secondary', 'btn-on')
    localStorage.setItem('paginator-card-view', 'false')
}

function cardView() {
    $a('.card.card-option').forEach(node => {
        node.classList.add('w-md-25', 'mb-4')
        node.classList.remove('w-100', 'w-lg-75', 'mb-2')
    })
    $a('.mode').forEach(node => {
        node.classList.add('card-mode')
        node.classList.remove('list-mode')
    })
    $a('.card-body').forEach(node => {
        node.classList.remove('pt-1', 'pb-2')
    })
    $a('.card-body>.row').forEach(node => {
        node.classList.add('text-center')
    })
    $a('.items.row div').forEach(node => {
        node.classList.add('col-12')
        node.classList.remove('col-md', 'col-6')
    })

    $e('#list').classList.replace('btn-on', 'btn-secondary')
    $e('#card').classList.replace('btn-secondary', 'btn-on')
    localStorage.setItem('paginator-card-view', 'true')
}

function selectObjective(hover) {
    if(hover.length == 0) return

    radioFields = { length: 0 }
    activeSec_5 = [0, 4]
    activeSec_6 = [0, 2]
    activeSec_7 = [0, 4]

    $e('#f_survey').reset()
    $a('.table-header').forEach(node => 
        node.classList.replace('activated', 'deactivated')
    )

    $a('.card.card-option').forEach(node =>
        node.classList.remove('selected')
    )
    if(hover === true)
        $a('.card.card-option:hover').forEach(node =>
            node.classList.add('selected')
        )
    else 
        $e(`div#${hover}`).classList.add('selected')

    $e('#userObj').value = $e('.card.card-option.selected').getAttribute('data-id')
    $a('.force-disabled').forEach(node => {
        node.classList.replace('force-disabled', 'force-enabled')
    })
    log('[Survey] User selected!: '+$e('#userObj').value, STYLE.info)
}
