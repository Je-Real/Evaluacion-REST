let items, rows, numPages

window.addEventListener('load', (e) => {
    let y, arr_rows, rows_shown = ''

    $a('.paginator').forEach(node => {
        node.insertAdjacentHTML('beforebegin', '<div id="pag"></div>')
    })

    try {
        y = $e('#pag').getBoundingClientRect().y
        $e('#pag').style.top = (y - 225) + 'px'

        arr_rows = $e('.paginator').getAttribute('data-rows-shown').split(',')
    } catch (error) {
        return console.error(error)
    }

    for(let i in arr_rows) {
        rows_shown += `<option value="${parseInt(arr_rows[i])}" ${(i === 0) ? 'selected' : ''}>${parseInt(arr_rows[i])}</option>`
    }

    $a('.paginator').forEach(node => {
        node.insertAdjacentHTML('afterend', `<div class="pag-cont d-flex justify-content-md-between px-md-4">
            <div id="pag-ctrl" class="pagination my-auto">
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
    eventAssigner('#rows', 'change', rows)
})

function paginator() {
    /**
     * TODO: Limitar numero de paginas mostradas y agregar 
     * botones fijos de anterior y siguiente
     */
    $a('.num-pag').forEach(node => node.remove())

    items = $a('.paginator .pag-item')
    rows = parseInt($e('#rows').value),
    numPages = items.length/rows
    
    for(i=0; i<numPages; i++) {
        $e('#pag-ctrl').insertAdjacentHTML(
            'beforeend', `<a class="row-temp" rel="${i}">${(i+1)}</a>`
        )
    }

    try {
        $e('#pag-ctrl a[rel="0"]').classList.add('active')
        $e('#reg-total').innerHTML = items.length
    
        const pagCTRL = (e) => {
            $a('#pag-ctrl a').forEach(node => node.classList.remove('active'))
            e.target.classList.add('active')

            let currPage = e.target.getAttribute('rel'),
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

        eventAssigner('#pag-ctrl a', 'click', pagCTRL)

        pagCTRL({target: $e('#pag-ctrl a')})

    } catch {
        log('[Page-inator] No data to format', STYLE.error)
    }
}