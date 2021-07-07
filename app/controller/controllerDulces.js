const modelDulces = require('../model/modelDulces')

function index(req, res) {
    console.log('ok')
    modelDulces.find({})
    .then(dulces => {
        if (dulces.length) {
            return res.status(200).send({dulces})
        }
        else {
            return res.status(204).send({message: 'No content'})
        }
    })
    .catch(error => res.status(500).send({error}))
}

function add(req, res){
    new modelDulces(req.body).save()
    .then(dulces => {
        res.status(200).send({dulces})
    })
    .catch(error => res.status(500).send({error}))
}

function search(req, res, next){
    var consulta = {}
    consulta[req.params.key] = req.params.value
    
    modelDulces.find(consulta)
    .then(dulces => {
        if(!dulces.length) {
            return next()
        }
        else {
            req.body.dulces = dulces
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
    if(!req.body.dulces) return res.status(404).send({message: 'No se encontraron datos 🥶😢'})

    var dulcesObj = req.body.dulces[0]
    dulcesObj = Object.assign(dulcesObj, req.body)

    dulcesObj.save()
        .then(dulceUpd => {
            res.status(200).send({message: 'Los datos se han actualizado correctamente 😎👍', dulceUpd})
        })
        .catch(error => res.status(500).send({error}))
}

function destroyer(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.dulces) return res.status(404).send({message: 'No se encontraron datos para eliminar 🤯🤬'})
    
    req.body.dulces[0].remove()
        .then(dulceDelete => {
            return res.status(200).send({message: 'El Registro se ha eliminado correctamente 😱👌', dulceDelete})
        })
        .catch(error => res.status(500).send({error}))
}

function show(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.dulces) return res.status(404).send({message: 'No se encontraron datos 🥶😢'})
    
    var dulcesObj = req.body.dulces
    return res.status(200).send({dulcesObj})
}

module.exports = {
    index,
    add,
    search,
    update,
    destroyer,
    show
}