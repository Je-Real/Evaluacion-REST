const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Reportes <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Reportes route
    return res.status(200).render('reportes')
}

function add(req, res) {
    modelEvaluation.find({ _id: req.body._id })
        .then(data => {
            new modelEvaluation(req.body).save()
                .then((data) => { //🟢
                    console.log('Subido pa!', data)
                    return res.status(200).render('reportes')
                })
                .catch(() => { //🔴
                    return res.status(200).render('reportes')
                })
        })
        .catch((error) => {
            console.log('Error', error)
            return res.status(200).render('reportes')
        })
}

function get(req, res) {
    modelEvaluation.find({ _id: req.query._id })
        .then(data => { //🟢
            return res.end(JSON.stringify({
				data: data,
                msg: 'Datos obtenidos.',
				status: 200,
				noti: true
			}))
        })
        .catch(error => { //🔴
            console.log('Error',error)
            return res.end(JSON.stringify({
				msg: 'Algo salio mal.\n\r¡No te alarmes! Todo saldra bien.',
				status: 404,
				noti: true
			}))
        })
}

module.exports = {
    root,
    add,
    get,
}