const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    var session, records
    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session
    }

    //Control route
    return res.status(200).render('control', { session: session })
}

async function get(req, res) {
    var search = {}    
    var lvl = (req.session.lvl >= 5) ? req.session.lvl : req.session.lvl+1,
        area = req.session.area,
        depa = req.session.department

    console.log('pto-'+area)

    await modelUserInfo.find(
        { level: lvl, area: area },
        { _id:1, first_name:1, last_name:1 }
    )
    .then(async(dataInfo) => {
        if(req.session.lvl <= 1) search.area = area
        else {
            search.area = area
            search.department = depa
        }

        await modelEvaluation.find(search, { _id:1, records:1 })
        .then((dataEval) => {
            var allData

            for(let i=0; i<=dataInfo.length; i++) {
                for(let j=0; j<=dataEval.length; j++) {
                    try{
                        if(dataInfo[i]._id == dataEval[j]._id) {
                            console.log('i: '+dataInfo[i]._id+' - e: '+dataEval[j]._id)
                            dataInfo[i].status = true
                        }
                    } catch {
                        j=j
                    }
                }
            }

            return res.end(JSON.stringify({
                dataI: dataInfo,
                status: 200,
                noti: false
            }))
        })
        .catch((error) => {
            console.error(error)
            return res.end(JSON.stringify({
                msg: 'No se puedo obtener registros.',
                msgType: 'error',
                status: 500,
                noti: true
            }))
        })
    })
    .catch((error) => {
        console.error(error)
        return res.end(JSON.stringify({
            msg: 'No se puedo obtener registros.',
            msgType: 'error',
            status: 500,
            noti: true
        }))
    })

    return res.end(JSON.stringify({
        msg: '🥶🚫',
        msgType: 'warning',
        status: 404,
        noti: true
    }))
}

module.exports = {
    root,
    get
}