const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')

const DATE = new Date()
const CURRENT_YEAR = DATE.getFullYear()

// >>>>>>>>>>>>>>>>>>>>>> Evaluation static <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let session, userData = []

	if(!req.session._id && !req.session.category) { // No session 😡
		return res.status(200).render('login', {
			title_page: 'UTNA - Inicio',
			session: req.session
		})
	} else { // Session 🤑
		session = req.session

		/** Search all subordinates and obtain whether
		 * each has current year evaluations or not 
		**/
		 await modelUserInfo.aggregate([
			{ $match: {
				manager: req.session._id,
				disabled: { $exists: false }
			} }, {
				$lookup: {
					from: 'evaluations',
					pipeline: [
						// Find out just records in the current year
						{ $unwind: { path: '$records', preserveNullAndEmptyArrays: true } },
						{ $match: { 'records.year': CURRENT_YEAR } },

						{ $set: {
							records: {
								$cond: [
									// If disable is not null (if exists)
									{ $eq: ['$records.disabled', true] },
									-1, // user disabled
									1 // user with an evaluation already done
								]
							}
						}}
					],
					localField: '_id',
					foreignField: '_id',
					as: 'eval_'
				}
			}, {
				$lookup: {
					from: 'areas',
					pipeline: [ { $unset: ['_id', 'n'] } ],
					localField: 'area',
					foreignField: 'n',
					as: 'area',
				}
			}, {
				$lookup: {
					from: 'directorates',
					pipeline: [ { $unset: ['_id', 'n', 'area'] } ],
					localField: 'directorate',
					foreignField: 'n',
					as: 'directorate',
				}
			}, {
				$replaceRoot: {
					newRoot: {
						$mergeObjects: [
							{ $arrayElemAt: ['$eval_', 0] },
							'$$ROOT',
						],
					}
				}
			}, {
				$set: {
					records: {
						$cond: [
							{ $ifNull: ['$records', false] },
							'$records',
							0 // If there isn't any record, then is available 
						]
					},
					area: {
						$cond: {
							if: { $eq: [[], '$area'], },
							then: '$$REMOVE',
							else: { $arrayElemAt: ['$area.description', 0] },
						},
					},
					directorate: {
						$cond: {
							if: { $eq: [[], '$directorate'], },
							then: '$$REMOVE',
							else: { $arrayElemAt: ['$directorate.description', 0] },
						},
					}
				},
			},
			{ $match: { records: 0 } }, // This match filters only the employees available
			{ $unset: [
				'area', 'directorate', 'category',
				'manager', 'eval_', '__v', 'log'
			] },
		])
		.then(async(data) => {
			/* 	Data to retrieve:
				[
					{
						_id: "0000"
						enabled: true | false
						name: "Name"
						records: 0
					},
					{...}
				]
			 */
			for(let i in data) {
				if(data[i]['records'] == 0) {
					userData.push(data[i])
				}
			}
		})
		.catch((error) => {
			console.error(error)
			userData = false
		})
		.finally(() => {
			//Evaluation static route
			return res.status(200).render('evaluation', {
				title_page: 'UTNA - Evaluacion',
				session: session,
				userData: userData
			})
		})
	}
}

async function post(req, res) {
	if(!('_id' in req.session)) {
		return res.json({
			msg: Array(
				`Por favor, inicia sesión nuevamente`,
				`Please, log in again`
			)[req.session.lang],
			status: 401,
			snack: true
		})
	}

	let score = 0,
		rec = req.body.records,
		answers = []

	for(let answer in rec) {
		if(rec[answer] >= 1 && rec[answer] <= 4)
			answers.push(rec[answer])
		else {
			return console.log(`Error: Answer ${answer}`)
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

	await modelUserInfo.findOne(
		{ _id: req.body._id },
		{ _id: true, area: true, directorate: true, position: true, manager: true }
	)
	.then(async(dataUInfo) => { //🟢
		if(dataUInfo) {
			await modelEvaluation.findOne({ _id: req.body._id })
			.then(async(dataEval) => { //🟢
				let insert = {}

				if(dataEval) {
					let ifEval = false
					if('records' in dataEval) 
						for(let d in dataEval.records) {
							if('year' in dataEval.records[d])
								if(dataEval.records[d].year == CURRENT_YEAR)
									ifEval = true
						}
					
					if(ifEval) // If a evaluation exits in the current year, return 👇
						return res.json({
							msg: Array(
								'¿¡Ya existe una evaluación para esta persona en este año!?',
								'¿¡There is already an evaluation for this person in this year!?'
								)[req.session.lang],
							resType: 'error',
							status: 500,
							snack: true
						})
					
					insert = {
						year: CURRENT_YEAR,
						score: score,
						answers: answers,
						area: dataUInfo.area,
						directorate: dataUInfo.directorate,
						position: dataUInfo.position,
						manager: dataUInfo.manager
					}

					return await modelEvaluation.updateOne({ _id: req.body._id }, { $push: { records: insert } })
					.then(() => { //🟢
						return res.json({
							msg: Array(
								'¡Evaluación registrada satisfactoriamente!',
								'Evaluation saved successfully!'
							)[req.session.lang],
							resType: 'success',
							status: 200,
							snack: true
						})
					})
					.catch((error) => { //🔴
						console.error(error)
						return res.json({
							msg: Array(
								'Imposible registrar resultados. Inténtalo más tarde.',
								'Unable to record results. Please try again later.'
							)[req.session.lang],
							resType: 'error',
							status: 500,
							snack: true
						})
					})
				} else {
					insert = {
						_id: req.body._id,
						records: [{
							year: CURRENT_YEAR,
							score: score,
							answers: answers,
							area: dataUInfo.area,
							directorate: dataUInfo.directorate,
							position: dataUInfo.position,
							manager: dataUInfo.manager
						}]
					}
	
					await new modelEvaluation(insert).save()
					.then(() => { //🟢
						return res.json({
							msg: Array(
								'¡Evaluación registrada satisfactoriamente!',
								'Evaluation saved successfully!'
							)[req.session.lang],
							resType: 'success',
							status: 200,
							snack: true
						})
					})
					.catch((error) => { //🔴
						console.error(error)
						return res.json({
							msg: Array(
								'Imposible registrar resultados. Inténtalo más tarde.',
								'Unable to record results. Please try again later.'
							)[req.session.lang],
							resType: 'error',
							status: 500,
							snack: true
						})
					})
				}
			})
			.catch((error) => { //🔴
				console.error(error)
					return res.json({
						msg: Array(
							'Imposible registrar resultados. Inténtalo más tarde.',
							'Unable to record results. Please try again later.'
						)[req.session.lang],
						resType: 'error',
						status: 500,
						snack: true
					})
			})
		} else {
			console.log(dataUInfo)
			console.error('No length in user info search!')
			return res.json({
				msg: Array(
					'¿¡No existe el usuario seleccionado!?',
					'The selected user does not exist!?'
				)[req.session.lang],
				resType: 'error',
				status: 500,
				snack: true
			})
		}
	})
	.catch((error) => { //🔴
		console.error(error)
		return res.json({
			msg: Array(
				'¿¡No existe el usuario actual!? ¿¿¿Cómo lo lograste???',
				'The selected user does not exist!? ¿¿¿How did you do it???'
			),
			resType: 'error',
			status: 500,
			snack: true
		})
	})
}

function weighting(numAnswer, answer) {
	let failure = (question) => { return {
		msg: 'Error: No se obtuvo calificación de ' + question,
		resType: 'error',
		snack: true,
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