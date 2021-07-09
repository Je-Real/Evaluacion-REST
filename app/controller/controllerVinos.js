const modelVinos = require('../model/modelVinos')

function index(req, res) {
    console.log('ok')
    modelVinos.find({})
    .then(vinos => {
        if (vinos.length) {
            return res.status(200).send({vinos})
        }
        else {
            return res.status(204).send({message: 'No content'})
        }
    })
    .catch(error => res.status(500).send({error}))
}

function add(req, res){
    new modelVinos(req.body).save()
    .then(vinos => {
        res.status(200).send({vinos})
    })
    .catch(error => res.status(500).send({error}))
}

function search(req, res, next){
    var consulta = {}
    consulta[req.params.key] = req.params.value
    
    modelVinos.find(consulta)
    .then(vinos => {
        if(!vinos.length) {
            return next()
        }
        else {
            req.body.vinos = vinos
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
    if(!req.body.vinos) return res.status(404).send({message: 'No se encontraron vinos 🥴🥶'})

    var vinosObj = req.body.vinos[0]
    vinosObj = Object.assign(vinosObj, req.body)

    vinosObj.save()
        .then(vinosUpdate => {
            res.status(200).send({message: 'Los vinos se han actualizado correctamente 😎🥴🤘', vinosUpdate})
        })
        .catch(error => res.status(500).send({error}))
}

function destroyer(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.vinos) return res.status(404).send({message: 'No se encontraron datos para eliminar 🤯🤬'})
    
    req.body.vinos[0].remove()
        .then(vinosDelete => {
            return res.status(200).send({message: 'El Registro se ha eliminado correctamente 😱👌', vinosDelete})
        })
        .catch(error => res.status(500).send({error}))
}

function show(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.vinos) return res.status(404).send({message: 'No se encontraron datos 🥶😢'})
    
    var vinosObj = req.body.vinos
    return res.status(200).send({vinosObj})
}

module.exports = {
    index,
    add,
    search,
    update,
    destroyer,
    show
}