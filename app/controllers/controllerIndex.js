//Import db model
const modelEval = require('../models/modelEval')
const path = require('path')

// >>>>>>>>>>>>>>>>>>>>>> Index <<<<<<<<<<<<<<<<<<<<<<
function index(req, res) {
    //Root route
    return res.status(200).render(path.join(__dirname + '/../views/index'))

    /*modelEval.find({})
    .then(eval => {
        if (eval.length) {
            console.log('yeah')
            return res.status(200).send('../views/index')
        }
        console.log('yeah no')
        return res.status(204).send({message: 'No se encontraron datos..'})
    })
    .catch(error => res.status(500).send({error}))*/
}

function search(req, res, next){
    //Variable for a bunch of information to search
    var consulta = {}
    //Save the value with its key
    consulta[req.params.key] = req.params.value
    
    //Search route promise
    modelEval.find(consulta)
    .then(eval => {
        if(!eval.length) {
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

function show(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.eval) return res.status(404).send({message: 'No se encontraron datos.'})
    
    var evalObj = req.body.eval
    return res.status(200).send({evalObj})
}

module.exports = {
    index,
    search,
    show
}