const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const modelArea = require('../models/modelArea')
const modelDepartment = require('../models/modelDepartment')
const modelCareer = require('../models/modelCareer')

// >>>>>>>>>>>>>>>>>>>>>> Reportes <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    var date = new Date()
    var hour = date.getHours()
    var s, session

    if(hour >= 5 && hour <= 12) { s = 'Buen dia' } 
    else if (hour > 12 && hour <= 19) { s = 'Buenas tardes' }
    else { s = 'Buenas noches' }

    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session
    }

    if(req.session.lvl <= 1){
        var area, department
        var getter /* Ex: getter.eval[num_doc].field */

        await modelArea.find({}) // Get all areas in DB
        .then((data) => { //🟢
            area = data
        })
        .catch((error) => { //🔴
            area = null
        })

        await modelDepartment.find({}) // Get all departments in DB
        .then((data) => { //🟢
            department = data
        })
        .catch((error) => { //🔴
            department = null
        })

        await modelEvaluation.find({}) // Get all evaluations
        .then((dataE) => { //🟢
            getter = { eval: dataE }
        })
        .catch((error) => { //🔴
            getter = error
        })

        return res.status(200).render('reportes', {
            session: session,
            depa: department,
            area: area,
            hour: hour,
            s: s
        })
    }

    //Reportes route
    return res.status(200).render('reportes', {
        session: session,
        hour: hour,
        s: s
    })
}

async function get(req, res) {
    
    var search = (req.body.area) ? { area: req.body.area } :
    
        await modelEvaluation.find({ area: req.session.area })
        .then((data) => { //🟢
            return res.end(JSON.stringify({
                data: data,
                msg: 'Datos obtenidos.',
                status: 200,
                noti: true
            }))
        })
        .catch((error) => { //🔴
            console.error(error)
            return res.end(JSON.stringify({
                msg: 'Algo salio mal.\n\r¡No te alarmes! Todo saldra bien.',
                status: 404,
                noti: true,
                error: error
            }))
        })

        if(req.body.area && req.body.department){
            //console.log('Admin request (Double) (Reporte)')
            await modelEvaluation.find({ area: req.body.area, department: req.body.department })
                .then((data) => { //🟢
                    return res.end(JSON.stringify({
                        data: data,
                        msg: 'Datos obtenidos.',
                        status: 200,
                        noti: true
                    }))
                })
                .catch((error) => { //🔴
                    console.error(error)
                    return res.end(JSON.stringify({
                        msg: 'No se encontraron datos.',
                        status: 404,
                        noti: true,
                        error: error
                    }))
                })
        } else {
            //console.log('User request (Simple) (Reporte)')
            await modelEvaluation.find({ area: req.body.area })
                .then((data) => { //🟢
                    return res.end(JSON.stringify({
                        data: data,
                        msg: 'Datos obtenidos.',
                        status: 200,
                        noti: true
                    }))
                })
                .catch((error) => { //🔴
                    console.error(error)
                    return res.end(JSON.stringify({
                        msg: 'No se encontraron datos.',
                        status: 404,
                        noti: true,
                        error: error
                    }))
                })
        }
}

module.exports = {
    root,
    get,
}