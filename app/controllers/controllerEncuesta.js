const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')

// >>>>>>>>>>>>>>>>>>>>>> Encuesta static <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
    if(!req.session.user && !req.session.lvl) {
        // No session 😡
        session = null
    } else {
        // Session 🤑
        session = req.session
    }

    //Encuesta static route
    return res.status(200).render('encuesta', {session: session})
}

async function post(req, res) {
    var score = 0
    var rec = req.body.records
    const date = new Date()
    var year = date.getFullYear()

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

    for(var r in rec){
        score += parseFloat(rec[r])
    }

    var temp = Number((Math.abs(score) * 100).toPrecision(15))
    score = Math.round(temp) / 100 * Math.sign(score)

    await modelUserInfo.find({ _id: req.body._id })
		.then(async (dataUI) => { //🟢
            if(dataUI.length){
                await modelEvaluation.find({ _id: req.body._id })
                    .then(async (dataEval) => { //🟢
                        req.body.area = dataUI[0].area
                        req.body.department = dataUI[0].department
                        req.body.career = dataUI[0].career

                        if(dataEval.length){
                            req.body.records = {}
                            req.body.records = dataEval.records
                            if(req.body.records[year] != undefined){
                                return res.end(JSON.stringify({
                                    msg: '¿¡Ya existe una evaluacion en este año!?\r\n¿Cómo lograste acceder de nuevo...?',
                                    resType: 'error',
                                    status: 500,
                                    noti: true
                                }))
                            }
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
                                    console.log(error)
                                    return res.end(JSON.stringify({
                                        msg: 'Imposible registrar resultados.\r\nIntentalo más tarde.',
                                        resType: 'error',
                                        status: 500,
                                        noti: true
                                    }))
                                })
                        }
                        req.body.records = {}
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
                                console.log(error)
                                return res.end(JSON.stringify({
                                    msg: 'Imposible registrar resultados.\r\nIntentalo más tarde.',
                                    resType: 'error',
                                    status: 500,
                                    noti: true
                                }))
                            })
                    })
                    .catch((error) => { //🔴
                        console.log(error)
                            return res.end(JSON.stringify({
                                msg: 'Imposible registrar resultados.\r\nIntentalo más tarde.',
                                resType: 'error',
                                status: 500,
                                noti: true
                            }))
                    })
            } else {
                console.log('Eyo error here!')
                return res.end(JSON.stringify({
                    msg: '¿¡No existe el usuario actual!?.\r\n¿¿¿Cómo lo lograste???',
                    resType: 'error',
                    status: 500,
                    noti: true
                }))
            }
		})
		.catch((error) => { //🔴
			console.log(error)
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