letvar arr_rows

window.addEventListener('DOMContentLoaded', async(e) => {
    var y, arr_rows, rows_shown = ''

    $('.paginator').before(`<div id="pag"></div>`)

    y = document.querySelector('#pag').getBoundingClientRect().y
    document.querySelector('#pag').style['top'] = (y - 225) + 'px'

    try {
        arr_rows = document.querySelector('.paginator').getAttribute('data-rows-shown').split(',')
    } catch {
        throw console.error('No data-rows-shown listed in .paginator!')
    }

    for (let i in arr_rows) {
        var sel = (parseInt(arr_rows[i]) >= 4 && parseInt(arr_rows[i]) <= 6) ? 'selected' : ''
        rows_shown += `<option value="${parseInt(arr_rows[i])}" ${sel}>${parseInt(arr_rows[i])}</option>`
    }

    $('.paginator').after(`
        <div class="pag-cont d-flex justify-content-md-between px-md-4">
            <div id="pag-ctrl" class="pagination my-auto">
                <a href="#" rel="prev">&laquo;</a>
                <a href="#" rel="next">&raquo;</a>
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
        </div>
    `)
    paginator()
    
    $('#rows').change(() => {
        if (parseInt($('#rows').val()) != rows) paginator()
    })
})

function paginator() {
    $('.row-temp').remove()

    var rows = parseInt($('#rows').val()),
        rowsTotal = $('.paginator .pag-item').length,
        numPages = rowsTotal/rows
    
    for (i=0; i<numPages; i++) {
        $('#pag-ctrl a[rel="next"]').before(`<a class="row-temp" href="#pag" rel="${i}">${(i+1)}</a>`)
    }

    $('#pag-ctrl a[rel="prev"]').addClass('blocked')
    $('#pag-ctrl a[rel="0"]').addClass('active')
    $('#reg-total').text(rowsTotal)
    
    $('#pag-ctrl a').bind('click', function() {
        $('#pag-ctrl a').removeClass('active')
        $(this).addClass('active')

        var currPage = $(this).attr('rel'),
            startItem = currPage * rows,
            endItem = startItem + rows

        try {
            $('.paginator tr.pag-item').css('opacity','0.0').hide().slice(startItem, endItem)
                .animate({opacity:1}, 300).css('display','table-row')
        } catch { }

        try {
            $('.paginator div.pag-item').css('opacity','0.0').hide().slice(startItem, endItem)
                .animate({opacity:1}, 300).css('display','block')
        } catch { }
    })

    $('.paginator .pag-item').hide()
    $('.paginator .pag-item').slice(0, rows).show()
}