//Import db model
const modelEval = require('../model/modelEval')

function index(req, res) {
    //console.log('ok')
    //Root route promise
    modelEval.find({})
    .then(eval => {
        if (eval.length) {
            return res.status(200).send({eval})
        }
        return res.status(204).send({message: 'No se encontraron datos..'})
    })
    .catch(error => res.status(500).send({error}))
}

function add(req, res){
    //Add route promise
    new modelEval(req.body).save()
    .then(eval => {
        res.status(200).send({eval})
    })
    .catch(error => res.status(500).send({error}))
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

function update(req, res) {
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.eval) return res.status(404).send({message: 'No se encontraron datos.'})

    var evalObj = req.body.eval[0]
    evalObj = Object.assign(evalObj, req.body)

    //Search route promise
    evalObj.save()
        .then(dulceUpd => {
            res.status(200).send({message: 'Los datos se han actualizado correctamente.', dulceUpd})
        })
        .catch(error => res.status(500).send({error}))
}

function destroyer(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.eval) return res.status(404).send({message: 'No se encontraron datos para eliminar.'})
    
    req.body.eval[0].remove()
        .then(dulceDelete => {
            return res.status(200).send({message: 'El Registro se ha eliminado correctamente.', dulceDelete})
        })
        .catch(error => res.status(500).send({error}))
}

function show(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.eval) return res.status(404).send({message: 'No se encontraron datos.'})
    
    var evalObj = req.body.eval
    return res.status(200).send({evalObj})
}

module.exports = {
    index,
    add,
    search,
    update,
    destroyer,
    show
}