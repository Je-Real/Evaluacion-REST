const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Reporte-c <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Reporte-c route
    modelEvaluation.find({})
        .then(data => {  //🟢
            console.log(data)
            return res.status(200).render('reporte-c', {
                info: data
            })
        })
        .catch((error) => { //🔴
            console.log('Error', error)
            return res.status(200).render('reporte-c')
        })
}

function add(req, res) {
    modelEvaluation.find({ _id: req.body._id })
        .then(data => {
            new modelEvaluation(req.body).save()
                .then((data) => { //🟢
                    console.log('Subido pa!', data)
                    return res.status(200).render('reporte-c')
                })
                .catch(() => { //🔴
                    return res.status(200).render('reporte-c')
                })
        })
        .catch((error) => {
            console.log('Error', error)
            return res.status(200).render('reporte-c')
        })
}

function get(req, res) {
    modelEvaluation.find({ })
        .then(data => {
            return res.end(JSON.stringify({
				data: data,
                msg: 'Datos obtenidos.',
				status: 200,
				noti: true
			}))
        })
        .catch(error => {
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