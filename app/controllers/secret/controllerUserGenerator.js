const crypto = require('crypto-js')
const path = require('path');
const fs = require('fs')

var rawData

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    var session,
        booya = []
    
    if (!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session
    }

    fs.readFile(path.join(__dirname, '../../../db/user_generator.json'), 'utf8', (error, data) => {
        if (error) {
            throw console.error(error)
        }
        rawData = JSON.parse(data)
    })

    if (typeof rawData != 'undefined') {
        await generatorFixed(rawData)
        .then((data) => {
            booya = data

            //Root route
            return res.status(200).render('secret/userGenerator', {
                session: session,
                users: booya[0],
                userInfos: booya[1],
            })
        })
        .catch((error) => {
            console.error(error)

            //Root route
            return res.status(200).render('secret/userGenerator', {
                session: session,
                users: 'No data',
                userInfos: 'No data',
            })
        })
    }
}


async function generatorFixed(params) {
    var area
    var depa
    var care
    var lvl
    var user
    var pass
    var fn
    var ls
    var userer = []
    var inforer = []

    const d = new Date();
    
    var year = d.getFullYear();
    var month = (d.getMonth()+1 < 10 && String(d.getMonth()+1).length < 2) ? '0'+d.getMonth()+1 : d.getMonth()+1;
    var day = (d.getDate() < 10 && String(d.getDate()+1).length < 2) ? '0'+d.getDate()+1 : d.getDate()+1;

    var hour = (d.getHours() < 10 && String(d.getHours()+1).length < 2) ? '0'+d.getHours() : d.getHours();
    var minutes = (d.getMinutes() < 10 && String(d.getMinutes()+1).length < 2) ? '0'+d.getMinutes() : d.getMinutes();
    var seconds = (d.getSeconds() < 10 && String(d.getSeconds()+1).length < 2) ? '0'+d.getSeconds() : d.getSeconds();

    var date = year+'-'+month+'-'+day+'T'+hour+':'+minutes+':'+seconds+':000Z'

    try {
        // Fixed generator
        for(i in params) {
            area = params[i].area
            depa = params[i].department
            care = params[i].career
            lvl = params[i].level

            fn = params[i].first_name
            ls = params[i].last_name

            user = 'R00'+(i)
            pass = crypto.AES.encrypt(user, user).toString()

            userer[i] = {
                _id: user,
                last_conn: {
                    $date: date
                },
                created: {
                    $date: date
                },
                enabled: true,
                pass: pass
            }

            inforer[i] = {
                _id: user,
                first_name: fn,
                last_name: ls,
                level: lvl,
                area: area,
                department: depa,
                career: care,
                contract: 1,
                b_day: {
                    $date: "2000-03-14T00:00:00.000Z"
                },
                address: {
                    street: 'calle',
                    num: 0,
                    postal_code: 0
                }
            }            
        }
        return [userer, inforer]
    } catch (error) {
        throw error
    }
}

function nRandom(min, max) {
    if (min >= max) throw console.log('Minimo y maximo invertidos!')
        return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatorRex(params) {
    var area
    var depa
    var care
    var lvl
    var user
    var pass
    var fn
    var ls
    var userer = '['
    var inforer = '['

    var endHandler = ','

    //Random Generator
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
        if (i == 30-1) endHandler = ']'

        //si area no tiene depa entonces es nivel 1 (no depa no care)
        //si area tiene dapa entonces hay nivel 2 (si depa no care)
        //si depa no tiene carrera entonces hay nivel 3 (si depa no care)
        //si depa tiene carrera entonces hay niveles 4 y 5 (si depa si care)

        if (depa == 0 && care == 0) lvl = 1
        else if (depa > 0 && care == 0) lvl = nRandom(2, 3)
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
                "num: 0,
                "postal_code: 0
            }
        },`
    }
}

/*function search(req, res, next) {
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
}*/

module.exports = {
    root
}