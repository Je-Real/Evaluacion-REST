var lvl, _id, done = ''

$(document).ready(() => {
    _id = $('#user').val()
    lvl = $('#lvl').val()


    setTimeout(() => {
        getRecords()
    }, 1000)
})


function getRecords() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/control/get',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: true,
        success: async(result) => {
            /*if(result.noti){
                await showSnack(result.msg, result.msgType)
            }*/

            if(result.status === 200){
                await $('#table-b').html('')
                
                for(var regInfo in result.dataI) {
                    
                    await $('#table-b').append(
                        `<tr id="${result.dataI[regInfo]._id}" class="${done}">
                            <td class="border-0 border-end text-center" >${result.dataI[regInfo]._id}</td>
                            <td class="border-0 border-start text-center" >${result.dataI[regInfo].first_name}</td>
                            <td class="border-0 border-start text-center" >${result.dataI[regInfo].last_name}</td>
                            <td class="border-0 border-start text-center" >${result.dataI[regInfo].status}</td>
                            <td class="border-0 border-start text-center justify-content-center px-md-4 d-flex">
                                <button type="button" class="btn btn-success mx-md-2 mx-1 p-1">
                                    <i class="fas fa-check-circle fa-2x"></i>
                                </button>
                                <button type="button" class="btn btn-warning mx-md-2 mx-1 p-1">
                                    <i class="fas fa-edit fa-2x"></i>
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