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
    var data = []

    if(req.session.lvl <= 1) {
        await modelEvaluation.find(
            { }, { _id:1, records:1 }
        ).skip(req.body.skip).limit(req.body.limit)
            .then(async (dataEval) => {
                await modelUserInfo.find(
                    { }, { _id:1, first_name:1, last_name:1 }
                ).skip(req.body.skip).limit(req.body.limit)
                    .then((dataInfo) => {
                        data[0] = dataEval
                        data[1] = dataInfo

                        return res.end(JSON.stringify({
                            data: data,
                            status: 200,
                            noti: true
                        }))
                    })
                    .catch((error) => {
                        console.log(error)
                        return res.end(JSON.stringify({
                            msg: 'No se puedo obtener registros.',
                            msgType: 'error',
                            status: 500,
                            noti: true
                        }))
                    })
            })
            .catch((error) => {
                console.log(error)
                return res.end(JSON.stringify({
                    msg: 'No se puedo obtener registros.',
                    msgType: 'error',
                    status: 500,
                    noti: true
                }))
            })
    }
    
    if(req.session.lvl == 3) {
        await modelEvaluation.find(
            { area: req.session.area, departament: req.session.departament },
            { _id:1, records:1 }
        ).skip(req.body.skip).limit(req.body.limit)
            .then(async (dataEval) => {
                await modelUserInfo.find(
                    { area: req.session.area, departament: req.session.departament },
                    { _id:1, first_name:1, last_name:1 }
                ).skip(req.body.skip).limit(req.body.limit)
                    .then((dataInfo) => {
                        data[0] = dataEval
                        data[1] = dataInfo

                        return res.end(JSON.stringify({
                            data: data,
                            status: 200,
                            noti: false
                        }))
                    })
                    .catch((error) => {
                        console.log(error)
                        return res.end(JSON.stringify({
                            msg: 'No se puedo obtener registros.',
                            msgType: 'error',
                            status: 500,
                            noti: true
                        }))
                    })
            })
            .catch((error) => {
                console.log(error)
                return res.end(JSON.stringify({
                    msg: 'No se puedo obtener registros.',
                    msgType: 'error',
                    status: 500,
                    noti: true
                }))
            })
    }

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