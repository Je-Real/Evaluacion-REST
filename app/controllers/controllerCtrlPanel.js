const pdf = require('pdfjs')
const fs = require('fs')
const path = require('path')

const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const weighting = require('./controllerEvaluation').weighting

//const modelArea = require('../models/modelArea')

const DATE = new Date()
const currYear = String(DATE.getFullYear())

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let data = false

	if(!req.session._id && !req.session.category) { // No session 😡
		// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
		return res.status(200).render('login', {
			title_page: 'UTNA - Inicio',
			session: req.session
		})
	} else { // Session 🤑
		// >>>>>>>>>>>>>>>>>>>>>> AD Ctrl <<<<<<<<<<<<<<<<<<<<<<
		if(req.session.category == -1)
			return res.redirect('/admin-control/')

		/** Search all subordinates and obtain whether
		 * each has current year evaluations or not */
		await modelUserInfo.aggregate([
			{ $match: {
				manager: req.session._id,
				disabled: { $exists: false }
			} }, {
				$lookup: {
					from: 'evaluations',
					pipeline: [{
						$set: {
							records: {
							$cond: [
								{ $ifNull: [`$records.${currYear}`, false] }, // If records[current year] is not null (if exists)
								{ $cond: [
									{ $ifNull: [`$records.${currYear}.disabled`, false] }, // If disable is not null (if exists)
									-1, // user disabled
									1 // user with an evaluation already done
								]},
								0 // Else, no evaluation found
							]
							}
						}
					}],
					localField: '_id',
					foreignField: '_id',
					as: 'eval_'
				}
			}, {
				$replaceRoot: {
					newRoot: {
						$mergeObjects: [
							{ $arrayElemAt: [ '$eval_', 0 ] }, '$$ROOT'
						]
					}
				}
			}, {
				$set: {
					records: {
						$cond: [
							{ $ifNull: ['$records', false] },
							'$records',
							0
						]
					}
				}
			}, {
				$unset: [
					'level', 'area',
					'department', 'career',
					'contract', 'b_day',
					'address', 'manager',
					'eval_', '__v'
				]
			}
		])
		.then(dataInfo => {
			data = dataInfo
		})
		.catch(error => {
			console.error(error)
			data = false
		})
		.finally(() => {
			return res.status(200).render('ctrl_panel', {
				title_page: 'UTNA - Inicio',
				session: req.session,
				records: data
			})
		})
	}
}

async function pdfEvalFormat(req, res) {
	if(typeof req.session == 'undefined') {
		return res.end(JSON.stringify({
			msg: [
				`Por favor, inicia sesión nuevamente`,
				`Please, log in again`
			],
			status: 401,
			noti: true
		}))
	}
	const userID = req.params.id

	await modelUserInfo.aggregate([
		{ $match: { _id: userID } }, {
			$lookup: {
				from: 'evaluations',
				pipeline: [ { $unset: ['_id'] } ],
				localField: '_id',
				foreignField: '_id',
				as: 'evaluations'
			}
		}, {
			$lookup: {
				from: 'user_infos',
				pipeline: [{
					$unset: [
						'level', 'b_day', 'address', 'manager',
						'area', 'department', 'career', 'contract'
					]
				}],
				localField: 'manager',
				foreignField: '_id',
				as: 'mngr_info'
			}
		}, {
			$lookup: {
				from: 'areas',
				pipeline: [
					{ $unset: [ '_id', 'n' ] },
					{ $project: { area: '$desc' } }
				],
				localField: 'area',
				foreignField: 'n',
				as: 'area_'
			}
		}, {
			$lookup: {
				from: 'departments',
				pipeline: [
					{ $unset: [ '_id', 'n' ] },
					{ $project: { department: '$desc' } }
				],
				localField: 'department',
				foreignField: 'n',
				as: 'department_'
			}
		}, {
			$lookup: {
				from: 'careers',
				pipeline: [
					{ $unset: [ '_id', 'n' ] },
					{ $project: { career: '$desc' } }
				],
				localField: 'career',
				foreignField: 'n',
				as: 'career_'
			}
		}, {
			$lookup: {
				from: 'contracts',
				pipeline: [
					{ $unset: [ '_id', 'n' ] },
					{ $project: { contract: '$desc' } }
				],
				localField: 'contract',
				foreignField: 'n',
				as: 'contract_'
			}
		}, {
			$unset: [ 'area', 'department', 'career', 'contract' ]
		}, {
			$replaceRoot: {
				newRoot: {
					$mergeObjects: [
						{ $arrayElemAt: [ '$area_', 0 ] },
						{ $arrayElemAt: [ '$department_', 0 ] },
						{ $arrayElemAt: [ '$career_', 0 ] },
						{ $arrayElemAt: [ '$contract_', 0 ] },
						{ $arrayElemAt: [ '$evaluations', 0 ] },
						'$$ROOT'
					]
				}
			}
		}, {
			$set: { manager: { $arrayElemAt: [ '$mngr_info', 0 ] } }
		}, {
			$unset: [
				'evaluations', 'mngr_info', 'area_',
				'department_', 'career_', 'contract_',
				'level', 'b_day', 'address'
			]
		}
	])
	.then(async([data]) => {
		if(data != undefined) {
			/**
			 * Example of data to retrieve
				[
				  {
					_id: 'ID',
					name: 'NAME',
					area: 'AREA',
					department (?): 'DEPARTMENT',
					career (?): 'CAREER',
					contract: 'CONTRACT',
					records: { '2022': { score: 100, answers: [ ..11 positions.. ] } },
					manager: {
					  _id: 'MANAGER ID',
					  name: 'MANAGER NAME',
					}
				  }
				]
			 */

			const doc = new pdf.Document({
				width:   792,
				height:  612
			})
			const ext_1 = new pdf.ExternalDocument(
				fs.readFileSync(path.join(__dirname, '../assets/templates/formato-evaluacion-1.pdf'))
			)
			const ext_2 = new pdf.ExternalDocument(
				fs.readFileSync(path.join(__dirname, '../assets/templates/formato-evaluacion-2.pdf'))
			)
			const ext_3 = new pdf.ExternalDocument(
				fs.readFileSync(path.join(__dirname, '../assets/templates/formato-evaluacion-3.pdf'))
			)

			let date_time = new Date(Date.now()),
				dateFormated = date_time.getDate()+'/'+(date_time.getMonth()+1)+'/'+date_time.getFullYear(),
				answers = data.records[currYear].answers,
				yAnchor, xAnchor, total = 0, tempScore

			const printAnswers = (numFactor, yMargin = 2, result = false) => {
				if(numFactor > 0) {
					doc.cell({ width: 2.95*pdf.cm, x: xAnchor+((answers[numFactor-1]-1)*2.95*pdf.cm), y: yAnchor -= yMargin*pdf.cm })
					.text({ textAlign: 'center', fontSize: 7 }).add('X')

					tempScore = weighting(numFactor, answers[numFactor-1])
					total += tempScore

					doc.cell({ width: 2.95*pdf.cm, x: xAnchor+((answers[numFactor-1]-1)*2.95*pdf.cm), y: yAnchor - 0.6*pdf.cm })
					.text({ textAlign: 'center', fontSize: 7 }).add(tempScore+'%')

					if(result)
						doc.cell({ width: 1.25*pdf.cm, x: 25.5*pdf.cm, y: yAnchor - 0.6*pdf.cm })
						.text({ textAlign: 'center', fontSize: 7 }).add(tempScore+'%') // Result

					return tempScore
				}
			}

			try {
				let evalFactorSum

				// --------------------------- Page 1 --------------------------- //
				doc.setTemplate(ext_1)
				doc.cell({ width: 8*pdf.cm, x: 2*pdf.cm, y: 17.25*pdf.cm }) // Name
				.text({ textAlign: 'center', fontSize: 7 }).add(data.name)

				doc.cell({ width: 3.2*pdf.cm, x: 11.4*pdf.cm, y: 17.25*pdf.cm }) // Position
				.text({ textAlign: 'center', fontSize: 7 }).add(
					(data.position) ? data.position: ((data.direction) ? data.direction : data.area)
				)

				doc.cell({ width: 2*pdf.cm, x: 18.5*pdf.cm, y: 17.25*pdf.cm }) // Employee number
				.text({ textAlign: 'center', fontSize: 7 }).add(data._id)

				doc.cell({ width: 2.5*pdf.cm, x: 22.25*pdf.cm, y: 17.15*pdf.cm }) // Date
				.text({ textAlign: 'center', fontSize: 7 }).add(dateFormated)

				doc.cell({ width: 7.5*pdf.cm, x: 2.5*pdf.cm, y: 16.45*pdf.cm }) // Department
				.text({ textAlign: 'center', fontSize: 7 }).add((data.direction) ? data.direction : data.area)

				doc.cell({ width: 4.3*pdf.cm, x: 11.3*pdf.cm, y: 16.45*pdf.cm }) // Category
				.text({ textAlign: 'center', fontSize: 7 }).add(data.contract)

				doc.cell({ width: 1.3*pdf.cm, x: 16.9*pdf.cm, y: 16.45*pdf.cm }) // Average
				.text({ textAlign: 'center', fontSize: 7 }).add(data.records[currYear].score+'%')

				yAnchor = 13.5*pdf.cm + 2*pdf.cm // Added 2cm because de function iteration
				xAnchor = 13.1*pdf.cm            // Guide for the first column (for all pages)

				printAnswers(1, 2.03, true) // Evaluation Factor 1
				printAnswers(2, 2.03, true) // Evaluation Factor 2
				printAnswers(3, 2.03, true) // Evaluation Factor 3
				printAnswers(4, 2.03, true) // Evaluation Factor 4

				// --------------------------- Page 1 --------------------------- //

				// --------------------------- Page 2 --------------------------- //
				doc.setTemplate(ext_2)

				yAnchor = 16.4*pdf.cm + 1.5*pdf.cm
				evalFactorSum = printAnswers(5, 1.5, false) // Evaluation Factor 5-1
				evalFactorSum += printAnswers(6, 1.5, false) // Evaluation Factor 5-2
				evalFactorSum += printAnswers(7, 1.5, false) // Evaluation Factor 5-3
				evalFactorSum += printAnswers(8, 1.45, false) // Evaluation Factor 5-4

				doc.cell({ width: 1.25*pdf.cm, x: 25.5*pdf.cm, y: yAnchor - 1.1*pdf.cm })
				.text({ textAlign: 'center', fontSize: 7 }).add(evalFactorSum+'%') // Result

				yAnchor = 9.5*pdf.cm + 1.5*pdf.cm
				evalFactorSum = printAnswers(9, 1.5, false) // Evaluation Factor 6-1
				evalFactorSum += printAnswers(10, 1.6, false) // Evaluation Factor 6-2

				doc.cell({ width: 1.25*pdf.cm, x: 25.5*pdf.cm, y: yAnchor - 1.1*pdf.cm })
				.text({ textAlign: 'center', fontSize: 7 }).add(evalFactorSum+'%') // Result

				// --------------------------- Page 2 --------------------------- //

				// --------------------------- Page 3 --------------------------- //
				doc.setTemplate(ext_3)

				yAnchor = 16.35*pdf.cm + 1.6*pdf.cm
				evalFactorSum = printAnswers(11, 1.6, false) // Evaluation Factor 7-1
				evalFactorSum += printAnswers(12, 1.5, false) // Evaluation Factor 7-2
				evalFactorSum += printAnswers(13, 1.4, false) // Evaluation Factor 7-3
				evalFactorSum += printAnswers(14, 2.15, false) // Evaluation Factor 7-4

				doc.cell({ width: 1.25*pdf.cm, x: 25.5*pdf.cm, y: yAnchor - 1.1*pdf.cm })
				.text({ textAlign: 'center', fontSize: 7 }).add(evalFactorSum+'%') // Result
				doc.cell({ width: 1.25*pdf.cm, x: 25.5*pdf.cm, y: yAnchor - 1.65*pdf.cm })
				.text({ textAlign: 'center', fontSize: 7 }).add(total+'%') // Total

				doc.cell({ width: 4*pdf.cm, x: 1.7*pdf.cm, y: 6.15*pdf.cm })
				.text({ textAlign: 'left', fontSize: 7 })
				.add(req.session.name) // Name Evaluator

				doc.cell({ width: 4*pdf.cm, x: 1.7*pdf.cm, y: 5.55*pdf.cm }) // Position
				.text({ textAlign: 'left', fontSize: 7 })
				.add(
					(data.position) ? data.position: ((data.direction) ? data.direction : data.area)
				)

				// --------------------------- Page 3 --------------------------- //
			} catch (error) {
				console.error(error)
				await doc.end() // Close file
				return res.end(null)
			}

			res.setHeader("Content-Disposition", "attachment; output.pdf")
			await doc.pipe(res)
			await doc.end() // Close file
		} else {
			console.error('No data')
			return res.end(JSON.stringify({
				status: 404,
				error: 'No data'
			}))
		}
	})
	.catch(error => {
		console.error(error)
		return res.end(JSON.stringify({
			status: 500,
			error: error
		}))
	})
}

async function manageUserEvaluation(req, res) {
	const userId = req.params.id
	const action = req.params.action
	let save = { records: {} }

	modelEvaluation.findOne({ _id: userId })
	.then((data) => {
		save = data
		if(action == 'disabled')
			save['records'][currYear] = {disabled: true}
		else
			delete save['records'][currYear]

		new modelEvaluation(save).save()
		.then(() => {
			return res.end(JSON.stringify({
				status: 200,
				msg: true
			}))
		})
		.catch(error => {
			console.error(error)
			return res.end(JSON.stringify({
				status: 500,
				error: error
			}))
		})
	})
	.catch(error => {
		console.error(error)
		return res.end(JSON.stringify({
			status: 500,
			error: error
		}))
	})
}

module.exports = {
	root,
	pdfEvalFormat,
	manageUserEvaluation
}