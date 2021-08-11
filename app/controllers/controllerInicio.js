const modelContract = require('../models/modelContract')
const modelUser = require('../models/modelUser')
const modelUserInfo = require('../models/modelUserInfo')
const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

// >>>>>>>>>>>>>>>>>>>>>> Index <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    var contracts
    var def = {
        _id:"R000000000",
        level:0,
        enabled:true,
        pass:"U2FsdGVkX1+IE54q33BzZ4XZgsTyODbJhp5fv9ZWAxM=",
        first_name:"admin",
        last_name:"admin",
        area:1,
        department:1,
        career:1,
        contract:3,
        b_day:'2000-03-14',
        address:{"street":"admin","num":0,"postal_code":0}
    }

    modelContract.find({  })
        .then(data => {
            if(data.length){
                modelUser.find({ _id: def._id })
                    .then((data) => {
                        if(data.length){
                            console.log('Registro ya creado')
                            return res.status(200).render('inicio', {
                                contracts: contracts
                            })
                        } else {
                            new modelUserInfo(def).save()
                                .then(() => { //🟢
                                    new modelUser(def).save()
                                        .then(() => { //🟢
                                            return res.status(200).render('inicio', {
                                                contracts: contracts
                                            })
                                        })
                                        .catch((error) => { //🔴
                                            console.log(error)
                                            return res.status(200).render('inicio', {
                                                contracts: contracts
                                            })
                                        })
                                })
                                .catch((error) => { //🔴
                                    console.log(error)
                                    return res.status(200).render('inicio', {
                                        contracts: contracts
                                    })
                                })
                            
                            return res.status(200).render('inicio', {
                                contracts: contracts
                            })
                        }
                    })
                    .catch((error) => {
                        console.log('Fuck', error)
                        return res.status(200).render('inicio', {
                            contracts: contracts
                        })
                    })
            } else {
                console.log('Error no contratos')
                return res.status(200).render('inicio', {
                    contracts: contracts
                })
            }
        })
        .catch(() =>{
            console.log()
            return res.status(200).render('inicio', {
                contracts: contracts
            })
        })
}

function search(req, res, next) {
    //Variable for a bunch of information to search
    var consulta = {}
    //Save the value with its key
    consulta[req.params.key] = req.params.value

    //Search route promise
    modelEval.find(consulta)
        .then(eval => {
            if (!eval.length) {
                return next()
            }
            req.body.eval = eval
            return next()
        })
        .catch(error => {
            req.body.error = error
            next()
        })
}

function show(req, res) {
    if (req.body.error) return res.status(500).send({ error })
    if (!req.body.eval) return res.status(404).send({ message: 'No se encontraron datos.' })

    var evalObj = req.body.eval
    return res.status(200).send({ evalObj })
}

function test(req, res) {
    console.log('Testing inicio')
    return res.status(200).send('yeah') //Works!!! 😈
}

module.exports = {
    root,
    search,
    show,
    test
}