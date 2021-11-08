const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const modelArea = require('../models/modelArea')
const modelDepartment = require('../models/modelDepartment')
const modelCareer = require('../models/modelCareer')

// >>>>>>>>>>>>>>>>>>>>>> Encuesta static <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    var session, search = {},
        idGetter = [], arr1 = [], arr2 = [], userData = [], date =  new Date()

    /** Delete this 👇 and do a JOIN query */
    if (req.session.lvl == 1) search.level = parseInt(req.session.lvl)+1 
    else {
        search.level = parseInt(req.session.lvl)+1 
        if (req.session.area) search.area = req.session.area
        if (req.session.department) search.department = req.session.department
    }

    if (!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session

        await modelUserInfo.find(search, { _id:1, first_name:1, last_name:1 })
        .then(async(dataInfo) => {
            await modelEvaluation.find(search, { _id:1, records:1 })
            .then(async(dataEval) => {
                //Get all the info from subordinates
                for(let i in dataInfo) {
                    arr1[i] = dataInfo[i]['_id']
                }
                /*
                 * Get all the subordinates evaluations and
                 * and compare if there is no evaluation for the current year
                 */
                for(let j in dataEval) {
                    if (dataEval[j][date.getFullYear()] == undefined) {
                        arr2[j] = dataEval[j]['_id']
                    }
                }

                /*console.log(arr2);

                var asArray = Object.entries(dataEval);
                var filtered = asArray.filter(([key, value]) => typeof value === 'undefined');

                console.log(Object.fromEntries(filtered));*/

                //Filter the ids that have no evaluations for the current year
                idGetter = arr1.filter(d => !arr2.includes(d))

                /*
                 * Compare each item and get the user info that
                 * have no evaluations for the current year
                 */
                for(let k in arr1) {
                    for(let l in idGetter) {
                        if (idGetter[l] == arr1[k]) {
                            userData[k] = dataInfo[k]
                            break
                        }
                    }
                }

                //Get rid of the possible empty items in the userData
                userData = userData.filter(async(noEmpty) => {
                    return noEmpty
                })
            })
            .catch((error) => {
                console.error(error)
                userData = false
            })
        })
        .catch((error) => {
            console.error(error)
            userData = false
        })
    }

    //Encuesta static route
    return res.status(200).render('encuesta', {
        title_page: 'UTNA - Encuesta',
        session: session,
        userData: userData
    })
}

async function post(req, res) {
    const date = new Date()
    var score = 0,
        rec = req.body.records,
        year = String(date.getFullYear())

    var failure = (question) => {
        return res.end(JSON.stringify({
            msg: 'Error: No se obtuvo calificacion de ' + question,
            resType: 'error',
            noti: true,
            status: 500,
        }))
    }

    switch (rec.p_1) {
        case 4:
            rec.p_1 = 25
            break;
        case 3:
            rec.p_1 = 17.5
            break;
        case 2:
            rec.p_1 = 12.5
            break;
        case 1:
            rec.p_1 = 7.5
            break;
        default:
            return failure('p_1')
    }

    switch (rec.p_2) {
        case 4:
            rec.p_2 = 20
            break;
        case 3:
            rec.p_2 = 15
            break;
        case 2:
            rec.p_2 = 10
            break;
        case 1:
            rec.p_2 = 5
            break;
        default:
            return failure('p_2')
    }

    switch (rec.p_3) {
        case 4:
            rec.p_3 = 15
            break;
        case 3:
            rec.p_3 = 12.5
            break;
        case 2:
            rec.p_3 = 7.5
            break;
        case 1:
            rec.p_3 = 2.5
            break;
        default:
            return failure('p_3')
    }

    switch (rec.p_4) {
        case 4:
            rec.p_4 = 10
            break;
        case 3:
            rec.p_4 = 8.3
            break;
        case 2:
            rec.p_4 = 5
            break;
        case 1:
            rec.p_4 = 1.6
            break;
        default:
            return failure('p_4')
    }

    switch (rec.p_5) {
        case 4:
            rec.p_5 = 2.5
            break;
        case 3:
            rec.p_5 = 2.075
            break;
        case 2:
            rec.p_5 = 1.25
            break;
        case 1:
            rec.p_5 = 0.4
            break;
        default:
            return failure('p_5')
    }

    switch (rec.p_6) {
        case 4:
            rec.p_6 = 2.5
            break;
        case 3:
            rec.p_6 = 2.075
            break;
        case 2:
            rec.p_6 = 1.25
            break;
        case 1:
            rec.p_6 = 0.4
            break;
        default:
            return failure('p_6')
    }

    switch (rec.p_7) {
        case 4:
            rec.p_7 = 2.5
            break;
        case 3:
            rec.p_7 = 2.075
            break;
        case 2:
            rec.p_7 = 1.25
            break;
        case 1:
            rec.p_7 = 0.4
            break;
        default:
            return failure('p_7')
    }

    switch (rec.p_8) {
        case 4:
            rec.p_8 = 2.5
            break;
        case 3:
            rec.p_8 = 2.075
            break;
        case 2:
            rec.p_8 = 1.25
            break;
        case 1:
            rec.p_8 = 0.4
            break;
        default:
            return failure('p_8')
    }

    switch (rec.p_9) {
        case 4:
            rec.p_9 = 5
            break;
        case 3:
            rec.p_9 = 3.75
            break;
        case 2:
            rec.p_9 = 2.5
            break;
        case 1:
            rec.p_9 = 1.25
            break;
        default:
            return failure('p_9')
    }
    
    switch (rec.p_10) {
        case 4:
            rec.p_10 = 5
            break;
        case 3:
            rec.p_10 = 3.75
            break;
        case 2:
            rec.p_10 = 2.5
            break;
        case 1:
            rec.p_10 = 1.25
            break;
        default:
            return failure('p_10')
    }
    
    switch (rec.p_11) {
        case 4:
            rec.p_11 = 10
            break;
        case 3:
            rec.p_11 = 7.5
            break;
        case 2:
            rec.p_11 = 5
            break;
        case 1:
            rec.p_11 = 2.5
            break;
        default:
            return failure('p_11')
    }

    for(var r in rec) {
        score += parseFloat(rec[r])
    }

    //Round decimals
    var temp = Number((Math.abs(score) * 100).toPrecision(15))
    score = Math.round(temp) / 100 * Math.sign(score)

    await modelUserInfo.find({ _id: req.body._id }, { _id: 1 })
	.then(async(dataUI) => { //🟢
        if (dataUI.length) {
            await modelEvaluation.find({ _id: req.body._id })
            .then(async(dataEval) => { //🟢
                req.body.records = {}

                try { 
                    // Try to get the current year record and if it exists return the error message
                    if (dataEval.records[year] != undefined)
                        return res.end(JSON.stringify({
                            msg: '¿¡Ya existe una evaluacion para esta persona en este año!?',
                            resType: 'error',
                            status: 500,
                            noti: true
                        }))
                } catch { 
                    // if doesn't exits a record, then catch the expected error and save in the database
                    req.body.records[year] = score
            
                    await new modelEvaluation(req.body).save()
                    .then(() => { //🟢
                        return res.end(JSON.stringify({
                            msg: '¡Encuesta registrada satisfactoriamente!',
                            resType: 'success',
                            status: 200,
                            noti: true
                        }))
                    })
                    .catch((error) => { //🔴
                        console.error(error)
                        return res.end(JSON.stringify({
                            msg: 'Imposible registrar resultados.\r\nIntentalo más tarde.',
                            resType: 'error',
                            status: 500,
                            noti: true
                        }))
                    })
                }
            })
            .catch((error) => { //🔴
                console.error(error)
                    return res.end(JSON.stringify({
                        msg: 'Imposible registrar resultados.\r\nIntentalo más tarde.',
                        resType: 'error',
                        status: 500,
                        noti: true
                    }))
            })
        } else {
            console.error('Eyo error here!')
            return res.end(JSON.stringify({
                msg: '¿¡No existe el usuario actual!?.\r\n¿¿¿Cómo lo lograste???',
                resType: 'error',
                status: 500,
                noti: true
            }))
        }
	})
	.catch((error) => { //🔴
		console.error(error)
		return res.end(JSON.stringify({
			msg: '¿¡No existe el usuario actual!?.\r\n¿¿¿Cómo lo lograste???',
            resType: 'error',
			status: 500,
			noti: true
		}))
	})
}

module.exports = {
    root,
    post
}