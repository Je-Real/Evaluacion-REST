const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')

const DATE = new Date()
const currYear = '2020' //String(DATE.getFullYear())

// >>>>>>>>>>>>>>>>>>>>>> Evaluacion static <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    let session, userData = []

    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session

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
                    ? info : ((!(currYear in info.records))
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
        answers = []

    for(let answer in rec) {
        if(rec[answer] >= 1 && rec[answer] <= 4)
            answers.push(rec[answer])
        else {
            return console.log(`Error: No se obtuvo calificacion de ${answer}`)
        }
    }

    rec.r_1 = weighting(1, rec.r_1)
    rec.r_2 = weighting(2, rec.r_2)
    rec.r_3 = weighting(3, rec.r_3)
    rec.r_4 = weighting(4, rec.r_4)
    rec.r_5 = weighting(5, rec.r_5)
    rec.r_6 = weighting(6, rec.r_6)
    rec.r_7 = weighting(7, rec.r_7)
    rec.r_8 = weighting(8, rec.r_8)
    rec.r_9 = weighting(9, rec.r_9)
    rec.r_10 = weighting(10, rec.r_10)
    rec.r_11 = weighting(11, rec.r_11)
    rec.r_12 = weighting(11, rec.r_12)
    rec.r_13 = weighting(11, rec.r_13)
    rec.r_14 = weighting(11, rec.r_14)

    for(let r in rec) {
        score += parseFloat(rec[r])
    }

    //Round decimals
    let temp = Number((Math.abs(score) * 100).toPrecision(15))
    score = Math.round(temp) / 100 * Math.sign(score)

    await modelUserInfo.find({ _id: req.body._id }, { _id: 1, area: 1, department: 1, career: 1 })
	.then(async(dataUInfo) => { //🟢
        if(dataUInfo.length) {
            await modelEvaluation.find({ _id: req.body._id })
            .then(async(dataEval) => { //🟢
                let insert

                if(dataEval.length) {
                    insert = dataEval[0]
                    // If a evaluation exits in the current year, return the error message
                    if(currYear in insert.records)
                    return res.end(JSON.stringify({
                        msg: '¿¡Ya existe una evaluacion para esta persona en este año!?',
                        resType: 'error',
                        status: 500,
                        noti: true
                    }))
                } else
                    insert = { _id: req.body._id, records: {} }

                insert.records[currYear] = { score: score, answers: answers }
                insert.records[currYear].area = dataUInfo[0].area
                if(dataUInfo[0].department != null) insert.records[currYear].department = dataUInfo[0].department
                if(dataUInfo[0].career != null) insert.records[currYear].career = dataUInfo[0].career
                    
                
                await new modelEvaluation(insert).save()
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
            console.log(dataUInfo)
            console.error('No length in user info search!')
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
                    return 2.5
                case 3:
                    return 1.5
                case 2:
                    return 1
                case 1:
                    return 0.5
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 12:
            switch (answer) {
                case 4:
                    return 2.5
                case 3:
                    return 1.5
                case 2:
                    return 1
                case 1:
                    return 0.5
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 13:
            switch (answer) {
                case 4:
                    return 2.5
                case 3:
                    return 1.5
                case 2:
                    return 1
                case 1:
                    return 0.5
                default:
                    return failure('question-'+numAnswer)
            }
        
        case 14:
            switch (answer) {
                case 4:
                    return 2.5
                case 3:
                    return 1.5
                case 2:
                    return 1
                case 1:
                    return 0.5
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