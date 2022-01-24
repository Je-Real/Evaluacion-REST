const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')

const DATE = new Date()
// >>>>>>>>>>>>>>>>>>>>>> Evaluacion static <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    let session, userData = []

    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session

        /*  --------------------- Modifiy ------------------------   */

        await modelUserInfo.aggregate([
            { $match: { manager: req.session.user } }, {
                $lookup: {
                    from: "evaluations",
                    pipeline: [ { $unset: ['_id', '__v'] } ],
                    localField: "_id",
                    foreignField: "_id",
                    as: "eval",
                }
            }, {
                $lookup: {
                    from: "areas",
                    pipeline: [ { $unset: ["_id", "n"] } ],
                    localField: "area",
                    foreignField: "n",
                    as: "area",
                }
            }, {
                $lookup: {
                    from: "departments",
                    pipeline: [ { $unset: ["_id", "n", "area"]} ],
                    localField: "department",
                    foreignField: "n",
                    as: "department",
                }
            }, {
                $lookup: {
                    from: "careers",
                    pipeline: [ { $unset: ["_id", "n", "department"]} ],
                    localField: "careers",
                    foreignField: "n",
                    as: "career",
                }
            }, {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { $arrayElemAt: [ "$eval", 0 ] },
                            "$$ROOT"
                        ]
                    }
                }
            }, {
                $project: {
                    first_name: 1,
                    last_name: 1,
                    last_name: 1,
                    records: 1,
                    area: {
                        $cond: {
                           if: { $eq: [ [], "$area" ] },
                           then: "$$REMOVE",
                           else: { $arrayElemAt: ["$area.desc", 0] }
                        }
                    },
                    department: {
                        $cond: {
                           if: { $eq: [ [], "$department" ] },
                           then: "$$REMOVE",
                           else: { $arrayElemAt: ["$department.desc", 0] }
                        }
                    },
                    career: {
                        $cond: {
                           if: { $eq: [ [], "$career" ] },
                           then: "$$REMOVE",
                           else: { $arrayElemAt: ["$career.desc", 0] }
                        }
                    },
                }
            }
        ]).then(async(data) => {
            //Top tier query filter by 0s 🥶😎👌
            //Get all the users that doesn't have a evaluation in the current year
            Object.entries(data).filter(([,info], i) => {
                userData.push((!('records' in info))
                    ? info : ((!(String(new Date().getFullYear()) in info.records))
                        ? info : null)
                )
            })
        })
        .catch((error) => {
            console.error(error)
            userData = false
        })
    }

    //Evaluacion static route
    return res.status(200).render('evaluation', {
        title_page: 'UTNA - Evaluacion',
        session: session,
        userData: userData
    })
}

async function post(req, res) {
    let score = 0,
        rec = req.body.records,
        year = String(DATE.getFullYear()),
        answers = [],
        failure = (question) => {
            return res.end(JSON.stringify({
                msg: 'Error: No se obtuvo calificacion de ' + question,
                resType: 'error',
                noti: true,
                status: 500,
            }))
        }

        for(let answer in rec) {
            if(rec[answer] >= 1 && rec[answer] <= 4)
                answers.push(rec[answer])
            else {
                failure(`${answer}`)
                break
            }
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

    for(let r in rec) {
        score += parseFloat(rec[r])
    }

    //Round decimals
    let temp = Number((Math.abs(score) * 100).toPrecision(15))
    score = Math.round(temp) / 100 * Math.sign(score)

    await modelUserInfo.find({ _id: req.body._id }, { _id: 1 })
	.then(async(dataUI) => { //🟢
        if(dataUI.length) {
            await modelEvaluation.findOne({ _id: req.body._id })
            .then(async(dataEval) => { //🟢
                if(dataEval.length) {
                    // If a evaluation exits in the current year, return the error message
                    if(year in dataEval.records)
                        return res.end(JSON.stringify({
                            msg: '¿¡Ya existe una evaluacion para esta persona en este año!?',
                            resType: 'error',
                            status: 500,
                            noti: true
                        }))
                }

                dataEval.records[year] = {
                    score: score,
                    answers: answers
                }

                await new modelEvaluation(dataEval).save()
                .then(() => { //🟢
                    return res.end(JSON.stringify({
                        msg: '¡Evaluacion registrada satisfactoriamente!',
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
                msg: '¿¡No existe el usuario seleccionado!?',
                resType: 'error',
                status: 500,
                noti: true
            }))
        }
	})
	.catch((error) => { //🔴
		console.error(error)
		return res.end(JSON.stringify({
			msg: '¿¡No existe el usuario actual!?\r\n¿¿¿Cómo lo lograste???',
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