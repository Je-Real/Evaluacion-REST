window.addEventListener('load', async(e) => {
    let inputClick = () => {
        let active_V = 0,
            active_VI = 0

        if($e('input[name="P-I"]:checked').value) {
            $e('#P-I').classList.remove('deactivated')
            $e('#P-I').classList.add('activated')
        } else {
            $e('#P-I').classList.remove('activated')
            $e('#P-I').classList.add('deactivated')
        }

        if($e('input[name="P-II"]:checked').value) {
            $e('#P-II').classList.remove('deactivated')
            $e('#P-II').classList.add('activated')
        } else {
            $e('#P-II').classList.remove('activated')
            $e('#P-II').classList.add('deactivated')
        }
        
        if($e('input[name="P-III"]:checked').value) {
            $e('#P-III').classList.remove('deactivated')
            $e('#P-III').classList.add('activated')
        } else {
            $e('#P-III').classList.remove('activated')
            $e('#P-III').classList.add('deactivated')
        }
        
        if($e('input[name="P-IV"]:checked').value) {
            $e('#P-IV').classList.remove('deactivated')
            $e('#P-IV').classList.add('activated')
        } else {
            $e('#P-IV').classList.remove('activated')
            $e('#P-IV').classList.add('deactivated')
        }

        if($e('input[name="P-V"]:checked').value) { active_V++ } 
        else { active_V+-1 }
        if($e('input[name="P-VI"]:checked').value) { active_V++ } 
        else { active_V+-1 }
        if($e('input[name="P-VII"]:checked').value) { active_V++ } 
        else { active_V+-1 }
        if($e('input[name="P-VIII"]:checked').value) { active_V++ } 
        else { active_V+-1 }

        if(active_V == 4) {
            $e('#P-V').classList.remove('deactivated')
            $e('#P-V').classList.add('activated')
        } else {
            $e('#P-V').classList.remove('activated')
            $e('#P-V').classList.add('deactivated')
        }

        if($e('input[name="P-IX"]:checked').value) { active_VI++ } 
        else { active_VI+-1 }
        if($e('input[name="P-X"]:checked').value) { active_VI++ } 
        else { active_VI+-1 }

        if(active_VI == 2) {
            $e('#P-VI').classList.remove('deactivated')
            $e('#P-VI').classList.add('activated')
        } else {
            $e('#P-VI').classList.remove('activated')
            $e('#P-VI').classList.add('deactivated')
        }

        if($e('input[name="P-XI"]:checked').value) {
            $e('#P-VII').classList.remove('deactivated')
            $e('#P-VII').classList.add('activated')
        } else {
            $e('#P-VII').classList.remove('activated')
            $e('#P-VII').classList.add('deactivated')
        }
    }

    if(localStorage.getItem('paginator-card-view') === 'true') cardView()
    else listView()

    await getCookie('USelected')
    .then((data) => {
        selectObjective(data)
        log('[Survey] User selected!:'+data, STYLE.info)
        setCookie('USelected', '')
    })
    .catch((error) => {
        log('[Survey] User selected!:'+error, STYLE.warning)
    })

    eventAssigner('input[type="radio"]', 'onclick', inputClick)
})

let slctOjb = () => selectObjective(true)
eventAssigner('.card.card-option', 'click', slctOjb)

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
    log('[Survey] User selected!:'+$e('#userObj').value, STYLE.info)
}

function postSurvey() {
    if(String($e('#userObj').value).length <= 0)
        return showSnack(
            (lang == 0) ? 'Debes seleccionar a alguien para evaluar'
                        : 'You must select someone to evaluate',
            null, SNACK.warning
        )
    
    let grades = {
        p_1: $e('input[name="P-I"]:checked'),
        p_2: $e('input[name="P-II"]:checked'),
        p_3: $e('input[name="P-III"]:checked'),
        p_4: $e('input[name="P-IV"]:checked'),
        p_5: $e('input[name="P-V"]:checked'),
        p_6: $e('input[name="P-VI"]:checked'),
        p_7: $e('input[name="P-VII"]:checked'),
        p_8: $e('input[name="P-VIII"]:checked'),
        p_9: $e('input[name="P-IX"]:checked'),
        p_10: $e('input[name="P-X"]:checked'),
        p_11: $e('input[name="P-XI"]:checked')
    }

    for(let grade in grades) {
        if(grades[grade].value == undefined)
            return showSnack(
                (lang == 0) ? '¡Aun no se puede enviar!<br/>Debes completar la evaluación'
                            : 'Cannot be sent yet!<br/>You must complete the evaluation.',
                null, SNACK.warning
            )
        grades[grade] = parseInt(grades[grade].value)
    }

    let packed = {
        _id: $e('#userObj').value,
        records: grades
    }
    
    fetchTo(
        'http://localhost:999/evaluation',
        'POST',
        packed,
        (result) => {
            if(result.noti && result.status === 200) {
                showSnack(result.msg, null, SNACK.success)
                setTimeout(window.location.reload(false), 1500)
            }
            else showSnack(result.msg, null, SNACK.error)
        },
        (error) => showSnack(`Error: ${error}`, null, SNACK.error)
    )
}