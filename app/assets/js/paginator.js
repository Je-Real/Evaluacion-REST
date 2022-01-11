let arr_rows

window.addEventListener('load', async(e) => {
    let y, arr_rows, rows_shown = ''

    $a('.paginator').forEach(node => {
        node.insertAdjacentHTML('beforebegin', `<div id="pag"></div>`)
    })

    try {
        y = document.querySelector('#pag').getBoundingClientRect().y
        document.querySelector('#pag').STYLE['top'] = (y - 225) + 'px'
    } catch (error) {
        return console.error('[Paginator] No se encontro #pag')
    }

    try {
        arr_rows = document.querySelector('.paginator').getAttribute('data-rows-shown').split(',')
    } catch {
        return console.error('No data-rows-shown listed in .paginator!')
    }

    for(let i in arr_rows) {
        let sel = (parseInt(arr_rows[i]) >= 4 && parseInt(arr_rows[i]) <= 6) ? 'selected' : ''
        rows_shown += `<option value="${parseInt(arr_rows[i])}" ${sel}>${parseInt(arr_rows[i])}</option>`
    }

    $a('.paginator').forEach(node => {
        node.insertAdjacentHTML('afterend', `<div class="pag-cont d-flex justify-content-md-between px-md-4">
            <div id="pag-ctrl" class="pagination my-auto">
                <a  rel="prev">&laquo;</a>
                <a  rel="next">&raquo;</a>
            </div>

            <div class="d-flex">
                <div class="text-md-center me-3 d-flex">
                    <p class="text-black-50 my-auto">
                        Registros: <span id="reg-total" class="fw-bold mx-1">⛔</span>
                    </p>
                </div class="d-flex">
                <div class="rows-quantity">
                    <div class="form-floating">
                        <select name="rows" id="rows" class="form-select ps-4"
                            title="Rows-quantity" aria-label="Selección">
                            ${rows_shown}
                        </select>
                        <label for="rows">Filas</label>
                    </div>
                </div>
            </div>
        </div>`)
    })
    paginator()
    
    const rows = () => {
        if(parseInt($e('#rows').value) != rows) paginator()
    }
    eventAssigner('#rows', 'onchange', rows)
})

function paginator() {
    $a('.row-temp').forEach(node => node.remove())

    let rows = parseInt($e('#rows').value),
        rowsTotal = $a('.paginator .pag-item').length,
        numPages = rowsTotal/rows
    
    for(i=0; i<numPages; i++) {
        $e('#pag-ctrl a[rel="next"]').insertAdjacentElement(
            'beforebegin', `<a class="row-temp" href="#pag" rel="${i}">${(i+1)}</a>`
        )
    }

    $e('#pag-ctrl a[rel="prev"]').classList.add('blocked')
    $e('#pag-ctrl a[rel="0"]').classList.add('active')
    $e('#reg-total').innerHTML = rowsTotal
    
    const pagCTRL = (e) => {
        $e('#pag-ctrl a').classList.remove('active')
        $e(e.target).classList.add('active')

        let currPage = $e(e.target).getAttribute('rel'),
            startItem = currPage * rows,
            endItem = startItem + rows

        try {
            $a('.paginator tr.pag-item').forEach(node => { // Then apply them all the styles for hide 
                node.style.opacity = 0
                node.style.visibility = 'hide'
                node.style.display = 'none'
            })

            Array.prototype.slice.call( // Split the selected items in the table (from, to)
                $a('.paginator tr.pag-item'),
                startItem, endItem
            ).forEach(node => { // Then apply them all the styles for hide 
                node.style.opacity = 1
                node.style.visibility = 'visible'
                node.style.display = 'table-row'
            })
        } catch { }

        try {
            $a('.paginator div.pag-item').forEach(node => { // Then apply them all the styles for hide 
                node.style.opacity = 0
                node.style.visibility = 'hide'
                node.style.display = 'none'
            })

            Array.prototype.slice.call( // Split the selected items in the table (from, to)
                $a('.paginator div.pag-item'),
                startItem, endItem
            ).forEach(node => { // Then apply them all the styles for hide 
                node.style.opacity = 1
                node.style.visibility = 'visible'
                node.style.display = ''
            })
        } catch { }
    }
    eventAssigner('#pag-ctrl a', 'onclick', )

    $a('.paginator .pag-item').forEach(node => {
        node.style.visibility = 0
        node.style.display = 'none'
    })
    Array.prototype.slice.call( // Split the selected items in the table (from, to)
        $a('.paginator div.pag-item'),
        0, rows
    ).forEach(node => { // Then apply them all the styles for hide 
        node.style.opacity = 1
        node.style.display = ''
    })
}