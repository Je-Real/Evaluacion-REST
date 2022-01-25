window.addEventListener('load', async(e) => {
    const inputClick = () => {
        let active_V = 0,
            active_VI = 0,
            active_VII = 0
        
        try {
            if($e('input[name="P-I"]:checked').value) {
                $e('#P-I').classList.remove('deactivated')
                $e('#P-I').classList.add('activated')
            } else {
                $e('#P-I').classList.remove('activated')
                $e('#P-I').classList.add('deactivated')
            }
        } catch (e) {}

        try {
            if($e('input[name="P-II"]:checked').value) {
                $e('#P-II').classList.remove('deactivated')
                $e('#P-II').classList.add('activated')
            } else {
                $e('#P-II').classList.remove('activated')
                $e('#P-II').classList.add('deactivated')
            }
        } catch (e) {}
    
        try {
            if($e('input[name="P-III"]:checked').value) {
                $e('#P-III').classList.remove('deactivated')
                $e('#P-III').classList.add('activated')
            } else {
                $e('#P-III').classList.remove('activated')
                $e('#P-III').classList.add('deactivated')
            }
        } catch (e) {}
        
        try {
            if($e('input[name="P-IV"]:checked').value) {
                $e('#P-IV').classList.remove('deactivated')
                $e('#P-IV').classList.add('activated')
            } else {
                $e('#P-IV').classList.remove('activated')
                $e('#P-IV').classList.add('deactivated')
            }
        } catch (e) {}
    
        try {
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
        } catch (e) {}

        try {
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
        } catch (e) {}

        try {
            if($e('input[name="P-XI"]:checked').value) { active_VII++ } 
            else { active_VII+-1 }
            if($e('input[name="P-XII"]:checked').value) { active_VII++ } 
            else { active_VII+-1 }
            if($e('input[name="P-XIII"]:checked').value) { active_VII++ } 
            else { active_VII+-1 }
            if($e('input[name="P-XIV"]:checked').value) { active_VII++ } 
            else { active_VII+-1 }
            
            if(active_VII == 4) {
                $e('#P-VII').classList.remove('deactivated')
                $e('#P-VII').classList.add('activated')
            } else {
                $e('#P-VII').classList.remove('activated')
                $e('#P-VII').classList.add('deactivated')
            }
        } catch (e) {}
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

        if(String($e('#userObj').value).length <= 0)
            return showSnack(
                (lang == 0) ? 'Debes seleccionar a alguien para evaluar'
                            : 'You must select someone to evaluate',
                null, SNACK.warning
            )
        else id = $e('#userObj').value
        
        let scores = {
            p_1: parseInt($e('input[name="P-I"]:checked').value),
            p_2: parseInt($e('input[name="P-II"]:checked').value),
            p_3: parseInt($e('input[name="P-III"]:checked').value),
            p_4: parseInt($e('input[name="P-IV"]:checked').value),
            p_5: parseInt($e('input[name="P-V"]:checked').value),
            p_6: parseInt($e('input[name="P-VI"]:checked').value),
            p_7: parseInt($e('input[name="P-VII"]:checked').value),
            p_8: parseInt($e('input[name="P-VIII"]:checked').value),
            p_9: parseInt($e('input[name="P-IX"]:checked').value),
            p_10: parseInt($e('input[name="P-X"]:checked').value),
            p_11: parseInt($e('input[name="P-XI"]:checked').value),
            p_12: parseInt($e('input[name="P-XII"]:checked').value),
            p_13: parseInt($e('input[name="P-XIII"]:checked').value),
            p_14: parseInt($e('input[name="P-XIV"]:checked').value),
        }

        for(let score in scores) {
            if(scores[score] == undefined || scores[score] == null || scores[score] == 0)
                return showSnack(
                    (lang == 0) ? '¡Aun no se puede enviar!<br/>Debes completar la evaluación'
                                : 'Cannot be sent yet!<br/>You must complete the evaluation.',
                    null, SNACK.warning
                )
        }
    
        let packed = {
            _id: id,
            records: scores
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
