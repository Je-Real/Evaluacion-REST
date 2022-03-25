const pdf = require('pdfjs')
const fs = require('fs')
const path = require('path')

const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const modelPosition = require('../models/modelPosition')
const weighting = require('./controllerEvaluation').weighting

const DATE = new Date()
const CURRENT_YEAR = DATE.getFullYear()

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let data = false

	if(!req.session._id && !req.session.category) { // No session 😡
		// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
		return res.status(200).render('login', {
			title_page: 'UTNA - Inicio',
			session: req.session,
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
				enabled: true
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
							0 // If there isn't any record, then is available 
						]
					}
				}
			}, {
				$unset: [
					'category', 'area',
					'direction', 'position',
					'manager', 'eval_',
					'__v', 'log'
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
	if(!('_id' in req.session)) {
		res.append('msg', Array(
			`Por favor, inicia sesión nuevamente`,
			`Please, log in again`
		))
		res.append('snack', 'true')
		return res.status(401).end()
	}
	const userID = req.params.id

	return await modelUserInfo.aggregate([
		{ $match: { _id: userID } },
		{
			$lookup: {
				from: 'evaluations',
				pipeline: [
					{ $unset: ['_id', '__v', 'log'] },
					{ $unwind: { path: '$records' } },
					{ $match: { 'records.year': CURRENT_YEAR } }
				],
				localField: '_id',
				foreignField: '_id',
				as: 'evaluations',
			}
		}, {
			$lookup: {
				from: 'user_infos',
				pipeline: [ { $unset: ['manager', 'category', 'area',
					'direction', 'position', 'log', '__v', 'enabled'] } ],
				localField: 'manager',
				foreignField: '_id',
				as: 'mngr_info',
			}
		}, {
			$lookup: {
				from: 'areas',
				pipeline: [
					{ $unset: ['__v', '_id', 'log'] },
					{ $project: { area: '$description' } },
				],
				localField: 'area',
				foreignField: '_id',
				as: 'area_',
			}
		}, {
			$lookup: {
				from: 'directions',
				pipeline: [
					{ $unset: ['__v', '_id', 'log'] },
					{ $project: { direction: '$description' } }
				],
				localField: 'direction',
				foreignField: '_id',
				as: 'direction_',
			}
		}, {
			$lookup: {
				from: 'positions',
				pipeline: [
					{ $unset: ['__v', '_id', 'log'] },
					{ $project: { position: '$description' } }
				],
				localField: 'position',
				foreignField: '_id',
				as: 'position_',
			}
		}, {
			$lookup: {
				from: 'categories',
				pipeline: [
					{ $unset: ['__v', '_id', 'log'] },
					{ $project: { category: '$description' } }
				],
				localField: 'category',
				foreignField: '_id',
				as: 'category_',
			}
		}, 
		{ $unset: ['area', 'direction', 'position', 'category'] },
		{
			$replaceRoot: {
				newRoot: {
					$mergeObjects: [
						{ $arrayElemAt: ['$area_', 0] },
						{ $arrayElemAt: ['$direction_', 0] },
						{ $arrayElemAt: ['$position_', 0] },
						{ $arrayElemAt: ['$category_', 0] },
						{ $arrayElemAt: ['$evaluations', 0] },
						'$$ROOT',
					]
				}
			}
		}, {
			$set: {
				manager: {
					$arrayElemAt: ['$mngr_info', 0],
				}
			}
		}, {
			$unset: [
				'evaluations', 'mngr_info', 'area_',
				'direction_', 'position_', 'category_',
				'log', '__v', 'enabled',
			]
		},
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
					direction: 'DIRECTION',
					position: 'POSITION',
					category: 'CATEGORY',
					records: [
						{
							year: 2000,
							score: 100,
							answers: [ ..11 positions.. ],
							manager: 'ID',
							area: 0,
							direction: 0,
							position: 0
						}
					],
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
				answers = data.records.answers,
				yAnchor, xAnchor, total = 0, tempScore
			
			let userPosition = await modelPosition.findOne({_id: req.session.position}, {description: 1})
				.catch((error) => console.error(error))
			
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
				.text({ textAlign: 'center', fontSize: 7 }).add(data.position[req.session.lang])

				doc.cell({ width: 2*pdf.cm, x: 18.5*pdf.cm, y: 17.25*pdf.cm }) // Employee number
				.text({ textAlign: 'center', fontSize: 7 }).add(data._id)

				doc.cell({ width: 2.5*pdf.cm, x: 22.25*pdf.cm, y: 17.15*pdf.cm }) // Date
				.text({ textAlign: 'center', fontSize: 7 }).add(dateFormated)

				doc.cell({ width: 7.5*pdf.cm, x: 2.5*pdf.cm, y: 16.45*pdf.cm }) // Direction
				.text({ textAlign: 'center', fontSize: 7 }).add(data.direction[req.session.lang])

				doc.cell({ width: 4.3*pdf.cm, x: 11.3*pdf.cm, y: 16.45*pdf.cm }) // Category
				.text({ textAlign: 'center', fontSize: 7 }).add(data.category[req.session.lang])

				doc.cell({ width: 1.3*pdf.cm, x: 16.9*pdf.cm, y: 16.45*pdf.cm }) // Average
				.text({ textAlign: 'center', fontSize: 7 }).add(data.records.score+'%')

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
				.add((userPosition) ? userPosition.description[req.session.lang] : '')

				// --------------------------- Page 3 --------------------------- //
			} catch (error) {
				console.error(error)
				res.append('msg', Array(
					`Ha ocurrido un problema en el servidor. Revisa la consola del navegador y contacta con el administrador.`,
					`A problem has occurred on the server. Check the browser console and contact the administrator.`
				)[req.session.lang])
				res.append('snack', 'true')
				res.append('error', error)
				await doc.end() // Close file
				return res.status(500).end()
			}

			res.append(
				'filename',
				Array(`formato_de_evaluación-${data._id}.pdf`, `evaluation_format-${data._id}.pdf`)[req.session.lang]
			)
			res.append('msg', Array(
				`Documento generado correctamente. Descargando ahora.`,
				`Document generated successfully. Downloading now.`
			)[req.session.lang])
			res.append('snack', 'true')
			await doc.pipe(res)
			await doc.end() // Close file
		} else {
			res.append('msg', Array(
				`No se recibieron datos del empleado en la base de datos. Contacta con el administrador.`,
				`No employee data was received in the database. Contact the administrator.`
			)[req.session.lang])
			res.append('snack', 'true')
			return res.status(404).end()
		}
	})
	.catch(error => {
		console.error(error)
		res.append('msg', Array(
			`Ha ocurrido un problema en el servidor. Revisa la consola del navegador y contacta con el administrador.`,
			`A problem has occurred on the server. Check the browser console and contact the administrator.`
		)[req.session.lang])
		res.append('snack', 'true')
		res.append('error', error)
		return res.status(500).end()
	})
}

/**
 * Enable or disable a evaluation for a employee in
 * Evaluations collection
 * @param {*} req 
 * @param {*} res 
 */
async function manageUserEvaluation(req, res) {
	const id = req.params.id
	const action = req.params.action

	return modelEvaluation.aggregate([ // Find out just records in the current year
		{ $match: { _id: id } },
		{ $unwind: { path: '$records', preserveNullAndEmptyArrays: true } },
		{ $match: { 'records.year': 2022 } }
	])
	.then((data) => {
		let updater = {}
		if(data.length) 
			if('score' in data[0])
				return res.status(200).json({
					status: 200,
					msg: Array(
						'Ya hay una evaluación realizada, no se puede habilitar / deshabilitar.',
						'An evaluation has already been performed, it cannot be enabled / disabled.',
					)[req.session.lang],
					snack: true
				})

		if(action == 'disabled') // Push the current year with the disabled state
			updater = { $push: { records: { year: CURRENT_YEAR, disabled: true } } }
		else if(action == 'enabled') // Delete the current year record to set a evaluation
			updater = { $pull: { records: { year: CURRENT_YEAR } } }

		modelEvaluation.updateOne({ _id: id }, updater)
		.then(() => {
			return res.status(200).json({
				status: 200
			})
		})
		.catch(error => {
			console.error(error)
			return res.status(500).json({
				status: 500,
				error: error,
				msg: Array(
					'Hubo un error en el servidor al habilitar / deshabilitar.',
					'There was an error in the server when enabled / disabled.',
				)[req.session.lang],
				snack: true
			})
		})
	})
	.catch(error => {
		console.error(error)
		return res.json({
			status: 500,
			error: error,
			msg: Array(
				'Hubo un error en el servidor al habilitar / deshabilitar.',
				'There was an error in the server when enabled / disabled.',
			)[req.session.lang],
			snack: true
		})
	})
}

module.exports = {
	root,
	pdfEvalFormat,
	manageUserEvaluation
}