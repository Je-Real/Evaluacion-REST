const modelEval = require('../model/modelEval')

function index(req, res) {
    //console.log('ok')
    modelEval.find({})
    .then(eval => {
        if (eval.length) {
            return res.status(200).send({eval})
        }
        else {
            return res.status(204).send({message: 'No content'})
        }
    })
    .catch(error => res.status(500).send({error}))
}

function add(req, res){
    new modelEval(req.body).save()
    .then(eval => {
        res.status(200).send({eval})
    })
    .catch(error => res.status(500).send({error}))
}

function search(req, res, next){
    var consulta = {}
    consulta[req.params.key] = req.params.value
    
    modelEval.find(consulta)
    .then(eval => {
        if(!eval.length) {
            return next()
        }
        else {
            req.body.eval = eval
            return next()
        }
    })
    .catch(error => {
        req.body.error = error
        next()
    })
}

function update(req, res) {
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.eval) return res.status(404).send({message: 'No se encontraron datos 🥶😢'})

    var evalObj = req.body.eval[0]
    evalObj = Object.assign(evalObj, req.body)

    evalObj.save()
        .then(dulceUpd => {
            res.status(200).send({message: 'Los datos se han actualizado correctamente 😎👍', dulceUpd})
        })
        .catch(error => res.status(500).send({error}))
}

function destroyer(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.eval) return res.status(404).send({message: 'No se encontraron datos para eliminar 🤯🤬'})
    
    req.body.eval[0].remove()
        .then(dulceDelete => {
            return res.status(200).send({message: 'El Registro se ha eliminado correctamente 😱👌', dulceDelete})
        })
        .catch(error => res.status(500).send({error}))
}

function show(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.eval) return res.status(404).send({message: 'No se encontraron datos 🥶😢'})
    
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