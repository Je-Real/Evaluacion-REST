const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Index <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    var session
    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session
    }

    //Inicio route
    return res.status(200).render('inicio', {session: session})
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

function generatorRex() {
    var area
    var depa
    var care
    var lvl
    var user
    var pass
    var userer = '' 
    var inforer = ''

    for(var i = 0; i < 30; i++) {
        area = nRandom(1, 10)
        switch (area) {
            case 5:
                depa = nRandom(1, 7)
                break;
            case 6:
                depa = nRandom(8, 11)
                break;
            case 8:
                depa = nRandom(12, 16)
                break;
                
            default:
                depa = 0
                break;
        }

        switch (depa) {
            case 12:
                care = nRandom(1, 3)
                break;
            case 13:
                care = nRandom(4, 5)
                break;
            case 14:
                care = nRandom(6, 7)
                break;
            case 15:
                care = nRandom(8, 9)
                break;
            case 16:
                care = nRandom(10, 11)
                break;
        
            default:
                care = 0
                break;
        }

        cont = nRandom(1, 3)

        //si area no tiene depa entonces es nivel 1 (no depa no care)
        //si area tiene dapa entonces hay nivel 2 (si depa no care)
        //si depa no tiene carrera entonces hay nivel 3 (si depa no care)
        //si depa tiene carrera entonces hay niveles 4 y 5 (si depa si care)

        if(depa == 0 && care == 0) lvl = 1
        else if(depa > 0 && care == 0) lvl = nRandom(2, 3)
        else lvl = nRandom(4, 5)
        
        user = 'user'+(i+30)
        pass = crypto.AES.encrypt(user, user).toString()

        userer = userer + `{
            "_id": "${user}",
            "last_conn": {
                "$date": "2021-09-09T01:24:41.751Z"
            },
            "created": {
                "$date": "2021-09-09T01:24:41.751Z"
            },
            "enabled": true,
            "pass": "${pass}"
            },`

                    inforer = inforer +`{
            "_id": "${user}",
            "first_name": "${user}",
            "last_name": "${user}",
            "level": ${lvl},
            "area": ${area},
            "department": ${depa},
            "career": ${care},
            "contract": ${cont},
            "b_day": {
                "$date": "2021-08-23T00:00:00.000Z"
            },
            "address": {
                "street": "${user}",
                "num": 0,
                "postal_code": 0
            }
        },`
    }

    console.log('');
    console.log('');
    console.log('[')
    console.log(userer)
    console.log(']')
    
    console.log('');
    console.log('-------------------------');
    console.log('');
    
    console.log('[')
    console.log(inforer)
    console.log(']')
}

function nRandom(min, max){
    if(min >= max) throw console.log('Minimo y maximo invertidos!')
        return Math.floor(Math.random() * (max - min + 1)) + min
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