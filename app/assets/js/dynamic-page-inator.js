window.addEventListener('load', (e) => {
    dynamicPaginator()
})

function dynamicPaginator () {
    let rows_shown = 0
    
    $a('.dynamic-paginator').forEach(node => {
        node.insertAdjacentHTML('beforebegin', '<div id="pag"></div>')
    })
    
    try {
        y = $e('#pag').getBoundingClientRect().y
        $e('#pag').style.top = (y - 225) + 'px'
    
        arr_rows = $e('.dynamic-paginator').getAttribute('data-rows-shown').split(',')
    } catch (error) {
        return console.error(error)
    }
    
    for(let i in arr_rows) {
        rows_shown += `<option value="${parseInt(arr_rows[i])}" ${(i === 0) ? 'selected' : ''}>${parseInt(arr_rows[i])}</option>`
    }
    
    $a('.dynamic-paginator').forEach(node => {
        node.insertAdjacentHTML('afterend', `<div class="pag-cont d-flex justify-content-md-between px-md-4 py-2">
            <div id="pag-ctrl" class="pagination my-auto" data-current-page="0">
            </div>
    
            <div class="d-flex">
                <div class="text-md-center me-3 d-flex">
                    <p class="text-black-50 my-auto">
                        ${(lang == 0) ? 'Registros' : 'Records'}: <span id="reg-total" class="fw-bold mx-1">⛔</span>
                    </p>
                </div class="d-flex">
                <div class="rows-quantity">
                    <div class="form-floating">
                        <select name="rows" id="rows" class="form-select ps-4"
                            title="Rows-quantity" aria-label="Rows in view">
                            ${rows_shown}
                        </select>
                        <label for="rows">Filas</label>
                    </div>
                </div>
            </div>
        </div>`)
    })
}
