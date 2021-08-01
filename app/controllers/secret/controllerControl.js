const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    //Root route
    return res.status(200).render('secret/control', {localStorage: localStorage})
}

function search(req, res, next) {
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

function show(req, res) {
    if(req.body.error) return res.status(500).send({error})
    if(!req.body.eval) return res.status(404).send({message: 'No se encontraron datos.'})
    
    var evalObj = req.body.eval
    return res.status(200).send({evalObj})
}

module.exports = {
    root,
    search,
    show
}