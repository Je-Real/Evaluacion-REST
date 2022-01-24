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
        answers = []

    for(let answer in rec) {
        if(rec[answer] >= 1 && rec[answer] <= 4)
            answers.push(rec[answer])
        else {
            failure(`${answer}`)
            break
        }
    }

    rec.p_1 = weighting(1, rec.p_1)
    rec.p_2 = weighting(2, rec.p_2)
    rec.p_3 = weighting(3, rec.p_3)
    rec.p_4 = weighting(4, rec.p_4)
    rec.p_5 = weighting(5, rec.p_5)
    rec.p_6 = weighting(6, rec.p_6)
    rec.p_7 = weighting(7, rec.p_7)
    rec.p_8 = weighting(8, rec.p_8)
    rec.p_9 = weighting(9, rec.p_9)
    rec.p_10 = weighting(10, rec.p_10)
    rec.p_11 = weighting(11, rec.p_11)

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

function weighting(numAnswer, answer) {
    let failure = (question) => { return {
        msg: 'Error: No se obtuvo calificacion de ' + question,
        resType: 'error',
        noti: true,
        status: 500,
    }}

    switch (parseInt(numAnswer)) {
        case 1:
            switch (answer) {
                case 4:
                    return 25
                case 3:
                    return 17.5
                case 2:
                    return 12.5
                case 1:
                    return 7.5
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 2:
            switch (answer) {
                case 4:
                    return 20
                case 3:
                    return 15
                case 2:
                    return 10
                case 1:
                    return 5
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 3:
            switch (answer) {
                case 4:
                    return 15
                case 3:
                    return 12.5
                case 2:
                    return 7.5
                case 1:
                    return 2.5
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 4:
            switch (answer) {
                case 4:
                    return 10
                case 3:
                    return 8.3
                case 2:
                    return 5
                case 1:
                    return 1.6
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 5:
            switch (answer) {
                case 4:
                    return 2.5
                case 3:
                    return 2.075
                case 2:
                    return 1.25
                case 1:
                    return 0.4
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 6:
            switch (answer) {
                case 4:
                    return 2.5
                case 3:
                    return 2.075
                case 2:
                    return 1.25
                case 1:
                    return 0.4
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 7:
            switch (answer) {
                case 4:
                    return 2.5
                case 3:
                    return 2.075
                case 2:
                    return 1.25
                case 1:
                    return 0.4
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 8:
            switch (answer) {
                case 4:
                    return 2.5
                case 3:
                    return 2.075
                case 2:
                    return 1.25
                case 1:
                    return 0.4
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 9:
            switch (answer) {
                case 4:
                    return 5
                case 3:
                    return 3.75
                case 2:
                    return 2.5
                case 1:
                    return 1.25
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 10:
            switch (answer) {
                case 4:
                    return 5
                case 3:
                    return 3.75
                case 2:
                    return 2.5
                case 1:
                    return 1.25
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 11:
            switch (answer) {
                case 4:
                    return 10
                case 3:
                    return 7.5
                case 2:
                    return 5
                case 1:
                    return 2.5
                default:
                    return failure('question-'+numAnswer)
            }
    
        default:
            return failure('no question')
    }
}

module.exports = {
    root,
    post,
    weighting
}