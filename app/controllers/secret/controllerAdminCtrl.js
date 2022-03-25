const modelEvaluation = require('../../models/modelEvaluation')
const modelUserInfo = require('../../models/modelUserInfo')
const modelUser = require('../../models/modelUser')

const modelArea = require('../../models/modelArea')
const modelDirection = require('../../models/modelDirection')
const modelPosition = require('../../models/modelPosition')
const modelCategory = require('../../models/modelCategory')

const crypto = require('crypto-js')

const DATE = new Date()
const CURRENT_YEAR = DATE.getFullYear()

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let usersData = [], areaData,
		directionData, positionData,
		categoryData

	if(req.session.category == -1) {
		areaData = await modelArea.find({}, {_id: true, description: true})
			.catch(error => { console.error(error); return false })
		directionData = await modelDirection.find({}, {_id: true, description: true})
			.catch(error => { console.error(error); return false })
		positionData = await modelPosition.find({}, {_id: true, description: true})
			.catch(error => { console.error(error); return false })
		categoryData = await modelCategory.find({}, {_id: true, description: true})
			.catch(error => { console.error(error); return false })

		return res.status(200).render('secret/adminCtrl', {
			title_page: 'UTNA - Evaluacion',
			session: req.session,
			usersData: usersData,
			data: { // Lists for the front end variables
				areaData: JSON.stringify(await areaData),
				directionData: JSON.stringify(await directionData),
				positionData: JSON.stringify(await positionData),
				categoryData: JSON.stringify(await categoryData)
			},
			CURRENT_YEAR: DATE.getFullYear()
		})
	}
	else {
		res.redirect('/home/')
	}
}

async function search(req, res) {
	if(!('_id' in req.session)) {
		return res.status(401).json({
			msg:[
				`Por favor, inicia sesión nuevamente`,
				`Please, log in again`
			],
			snack: true,
			status: 401
		})
	}

	if(req.body) {
		try {
			let structure = [
				{ $sort: { _id: 1 } }, // ID 1st, Skip 2nd & limit 3rd
				{ $limit: parseInt(req.body.limit) },
				{ $sort: { _id: -1 } }
			]
			if(req.body.skip > 0)
				structure.splice(1, 0, { $skip: parseInt(req.body.skip) * parseInt(req.body.limit) })

			if(req.body.search == 1) {
				structure = [
					{ $sort: { _id: 1 } }, // ID 1st, Skip 2nd & limit 3rd
					{ $limit: parseInt(req.body.limit) },
					{
						$lookup: {
							from: 'users',
							pipeline: [ { $unset: ['_id', 'pass', '__v'] } ],
							localField: '_id',
							foreignField: '_id',
							as: 'user_'
						}
					}, {
						$lookup: {
							from: 'evaluations',
							let: { id: '$_id' },
							pipeline: [
								{ $unset: ['_id', '__v']},
								{ $unwind: { path: '$records' }},
								{ $match: {
									'records.year': {
											'$gte': CURRENT_YEAR-4, 
											'$lte': CURRENT_YEAR
										}
									}
								},
								{
									$group: {
										'_id': '$$id', 
										'records': {
											'$addToSet': '$records'
										}
									}
								}
						  	],
							localField: '_id',
							foreignField: '_id',
							as: 'eval_'
						}
					}, {
						$set: {
							user_: {
								$cond: {
									if: { $eq: ['$user_', []] },
									then: '$$REMOVE',
									else: { $arrayElemAt: ['$user_', 0] },
								}
							},
							eval_: {
								$cond: {
									if: { $eq: ['$eval_', []] },
									then: '$$REMOVE',
									else: { $arrayElemAt: ['$eval_', 0] }
								}
							}
						}
					}, { $unset: ['__v', 'log', 'eval_._id'] }
				]
				if(req.body.skip > 0) 
					structure.splice(1, 0, { $skip: parseInt(req.body.skip) * parseInt(req.body.limit) })

				modelUserInfo.aggregate(structure)
				.then(async(data) => {
					return res.status(200).json({
						data: data,
						count: await modelUserInfo.countDocuments({}),
						status: 200
					})
				})
			} else if(req.body.search == 2)
				modelArea.aggregate(structure)
				.then(async(data) => {
					return res.status(200).json({
						data: data,
						count: await modelArea.countDocuments({}),
						status: 200
					})
				})
			else if(req.body.search == 3)
				modelDirection.aggregate(structure)
				.then(async(data) => {
					return res.status(200).json({
						data: data,
						count: await modelDirection.countDocuments({}),
						status: 200
					})
				})
			else if(req.body.search == 4)
				modelPosition.aggregate(structure)
				.then(async(data) => {
					return res.status(200).json({
						data: data,
						count: await modelPosition.countDocuments({}),
						status: 200
					})
				})
			else if(req.body.search == 5)
				modelCategory.aggregate(structure)
				.then(async(data) => {
					return res.status(200).json({
						data: data,
						count: await modelCategory.countDocuments({}),
						status: 200
					})
				})
			else return res.status(418).json({
				msg: ['Sin datos', 'Without data'],
				status: 418
			})
		} catch (error) {
			console.error(error)
		}
	} else return res.status(418).json({
		msg: ['Sin datos', 'Without data'],
		status: 418
	})
}

function update(req, res) {
	if(!('_id' in req.session)) {
		return res.status(401).json({
			msg: [
				`Por favor, inicia sesión nuevamente`,
				`Please, log in again`
			],
			snack: true,
			status: 401
		})
	}

	if(req.body) {
		// yyyy-mm-dd
		const FORMAT_DATE = `${ DATE.getFullYear() }-`+
		`${ (String(DATE.getMonth()+1).length == 1) ? '0'+(DATE.getMonth()+1) : DATE.getMonth()+1 }-`+
		`${ (String(DATE.getDate()).length == 1) ? '0'+(DATE.getDate()) : DATE.getDate() }`
		// hh:mm
		const FORMAT_HOUR = `${ (String(DATE.getHours()).length == 1) ? '0'+(DATE.getHours()) : DATE.getHours() }:`+
		`${ (String(DATE.getMinutes()).length == 1) ? '0'+(DATE.getMinutes()) : DATE.getMinutes() }`

		req.body['log'] = {
			_id: req.session._id,
			name: req.session.name,
			timestamp: {
				date: FORMAT_DATE,
				time: FORMAT_HOUR
			},
			operation: 'modified'
		}

		let handler = {status: 200, msg:['Cambios guardados', 'Changes saved']}

		if('user' in req.body) {
			if('pass' in req.body.user)
				req.body.user.pass = crypto.AES.encrypt(String(req.body.user.pass), String(req.body._id)).toString()

			modelUser.updateOne({ _id: req.body._id}, { $set: req.body.user })
			//.then(data => console.log(data))
			.catch(error => { handler['user'] = false; console.error(error)})
		}

		if('user_info' in req.body) {
			return modelUserInfo.updateOne({ _id: req.body._id}, { $set: req.body.user_info })
			//.then(data => { console.log(data) })
			.catch(error => { handler['user_info'] = false; console.error(error)})
		}
		if('evaluation' in req.body || 'rm_evaluation' in req.body) {
			modelEvaluation.updateOne(
				{ _id: req.body._id},
				('evaluation' in req.body)
				? { $set: req.body.evaluation }
				: { $unset: req.body.rm_evaluation }
			).catch(error => { handler['evaluation'] = false; console.error(error)})
		}
		if('area' in req.body) {
			modelArea.updateOne({ _id: req.body._id}, { $set: req.body.area })
			.catch(error => { handler['area'] = false; console.error(error)})
		}
		if('direction' in req.body) {
			modelDirection.updateOne({ _id: req.body._id}, { $set: req.body.direction })
			.catch(error => { handler['direction'] = false; console.error(error)})
		}
		if('position' in req.body) {
			modelPosition.updateOne({ _id: req.body._id}, { $set: req.body.position })
			.catch(error => { handler['position'] = false; console.error(error)})
		}
		if('category' in req.body) {
			modelCategory.updateOne({ _id: req.body._id}, { $set: req.body.category })
			//.then(data => console.log(data))
			.catch(error => { handler['category'] = false; console.error(error)})
		}
		return res.json(handler)

	} else return res.status(418).json({
		status: 418,
		msg: ['Sin datos', 'Without data']
	})
}

module.exports = {
	root,
	search,
	update,
}