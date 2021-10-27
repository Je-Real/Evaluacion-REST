var rows

$(document).ready(function(){
    //$('.paginator').before()
    $('.paginator').after(`
        <div class="pag-cont d-flex justify-content-md-between">
            <div id="pag-ctrl" class="pagination">
                <a href="#" rel="prev">&laquo;</a>
                <a href="#" rel="next">&raquo;</a>
            </div>
            <div class="rows-quantity">
                <div class="form-floating">
                    <select name="rows" id="rows" class="form-select ps-4" title="Rows-quantity" aria-label="Selección" >
                        <option value="5" selected>5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                    </select>
                    <label for="rows">Filas</label>
                </div>
            </div>
        </div>
    `)
    paginator()
    
    $('#rows').change(() => {
        console.log('yeah')
        if (parseInt($('#rows').val()) != rows)
            paginator()
    })
})

function paginator() {
    $('.row-temp').remove()

    rows = parseInt($('#rows').val())
    var rowsTotal = $('.paginator tbody tr').length
    var numPages = rowsTotal/rows
    for(i=0; i<numPages; i++) {
        $('#pag-ctrl a[rel="next"]').before('<a class="row-temp" href="#" rel="'+i+'">'+(i + 1)+'</a> ')
    }
    $('.paginator tbody tr').hide()
    $('.paginator tbody tr').slice(0, rows).show()
    $('#pag-ctrl a[rel="prev"]').addClass('blocked')
    $('#pag-ctrl a[rel="0"]').addClass('active')
    
    $('#pag-ctrl a').bind('click', function(){
        $('#pag-ctrl a').removeClass('active')
        $(this).addClass('active')
        var currPage = $(this).attr('rel')
        var startItem = currPage * rows
        var endItem = startItem + rows
        $('.paginator tbody tr').css('opacity','0.0').hide().slice(startItem, endItem).
            css('display','table-row').animate({opacity:1}, 300)
    })
}

function go(where) {
    setCookie('USelected', where)
    window.location.href = String(location.href).slice(0, 21+1)+"encuesta/"
}