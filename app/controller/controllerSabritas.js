const modelSabritas = require('../model/modelSabritas')

function index(req, res) {
    console.log('ok')
    modelSabritas.find({})
    .then(sabritas => {
        if (sabritas.length) {
            return res.status(200).send({sabritas})
        }
        else {
            return res.status(204).send({message: 'No content'})
        }
    })
    .catch(error => res.status(500).send({error}))
}

function add(req, res){
    new modelSabritas(req.body).save()
    .then(sabritas => {
        res.status(200).send({sabritas})
    })
    .catch(error => res.status(500).send({error}))
}

function search(req, res, next){
    var consulta = {}
    consulta[req.params.key] = req.params.value
    
    modelSabritas.find(consulta)
    .then(sabritas => {
        if(!sabritas.length) {
            return next()
        }
        else {
            req.body.sabritas = sabritas
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
    if(!req.body.sabritas) return res.status(404).send({message: 'No se encontraron sabritas 🥴🥶'})

    var sabritasObj = req.body.sabritas[0]
    sabritasObj = Object.assign(sabritasObj, req.body)

    sabritasObj.save()
        .then(sabritasUpdate => {
            res.status(200).send({message: 'Los sabritas se han actualizado correctamente 😎🥴🤘', sabritasUpdate})
        })
        .catch(error => res.status(500).send({error}))
}

function destroyer(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.sabritas) return res.status(404).send({message: 'No se encontraron sabritas para eliminar 🤯🥴'})
    
    req.body.sabritas[0].remove()
        .then(sabritasDelete => {
            return res.status(200).send({message: 'El sabritas se ha eliminado correctamente 😱🥴👌', sabritasDelete})
        })
        .catch(error => res.status(500).send({error}))
}

function show(req, res){
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.sabritas) return res.status(404).send({message: 'No se encontraron sabritas 🥴😢'})
    
    var sabritasObj = req.body.sabritas
    return res.status(200).send({sabritasObj})
}

module.exports = {
    index,
    add,
    search,
    update,
    destroyer,
    show
}