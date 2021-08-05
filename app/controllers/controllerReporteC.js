const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Reporte-c <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Reporte-c route
    modelEvaluation.find({})
        .then(data => {
            console.log(data)
            return res.status(200).render('reporte-c')
        })
        .catch((error) => {
            console.log('Error', error)
            return res.status(200).render('reporte-c')
        })
}

function add(req, res) {
    modelEvaluation.find({ _id: req.body._id })
        .then(data => {
            console.log(data)

            new modelEvaluation(req.body).save()
                .then((data) => { //🟢
                    console.log('Subido pa!', data)
                    return res.status(200).render('reporte-c')
                })
                .catch((error) => { //🔴
                    return res.status(200).render('reporte-c')
                })
        })
        .catch((error) => {
            console.log('Error', error)
            return res.status(200).render('reporte-c')
        })
}

module.exports = {
    root,
    add
}