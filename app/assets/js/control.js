var skip, limit,
    lvl, _id, done = ''

$(document).ready(() => {
    _id = $('#user').val()
    lvl = $('#lvl').val()

	skip = 0
    limit = $('select.dataTable-selector').val()

    setTimeout(() => {
        getRecords()
    }, 1000)
})

$('select.dataTable-selector').change(() => {
    skip = 0
    limit = $('select.dataTable-selector').val()
})

function getRecords() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/control/get',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({ skip: skip, limit: limit }),
        dataType: 'json',
        async: true,
        success: async function(result){
            if(result.noti){
                await showSnack(result.msg, result.msgType)
            }

            if(result.status === 200){
                console.log(result.data[1])
                await $('#table-body').html('')

                for(var regInfo in result.data[1]) {
                    /*if(result.data[1][reg].id === result.data[0][regInfo].id )
                        done = 'bg-success'
                    else
                        done = 'bg-warning'*/
                    
                    await $('#table-body').append(
                        `<tr class="${done}">
                            <td>${result.data[1][regInfo]._id}</td>
                            <td>${result.data[1][regInfo].first_name}</td>
                            <td>${result.data[1][regInfo].last_name}</td>
                            <td>---</td>
                            <td>---</td>
                            <td>---</td>
                            <td class="justify-content-between px-md-4 d-flex">
                                <button type="button" class="btn btn-success mx-md-2 mx-1 p-1">
                                    <i class="fas fa-check-circle fa-2x"></i>
                                </button>
                                <button type="button" class="btn btn-warning mx-md-2 mx-1 p-1">
                                    <i class="fas fa-edit fa-2x"></i>
                                </button>
                                <button type="button" class="btn btn-danger mx-md-2 mx-1 p-1">
                                    <i class="fas fa-ban fa-2x"></i>
                                </button>
                            </td>
                        </tr>`
                    )
                }
            }
        },
        error: function (xhr, status, error) { 
            showSnack('Status:'+status+'. '+error, 'error')
        }
    })
}