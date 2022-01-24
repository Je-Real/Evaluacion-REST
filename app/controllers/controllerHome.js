function search(req, res, next) {
    //Variable for a bunch of information to search
    let consulta = {}
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
    if(req.body.error) return res.status(500).send({ error })
    if(!req.body.eval) return res.status(404).send({ message: 'No se encontraron datos.' })

    let evalObj = req.body.eval
    return res.status(200).send({ evalObj })
}

function test(req, res) {
    console.log('Testing inicio')
    return res.status(200).send('yeah') //Works!!! 😈
}

module.exports = {
    search,
    show,
    test
}