const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')

const modelArea = require('../../models/modelArea')
const modelDirection = require('../../models/modelDirection')
const modelCategory = require('../../models/modelCategory')
const modelPosition = require('../../models/modelPosition')

const fuzzy = require('../util/util').fuzzySearch

const crypto = require('crypto-js')

const DATE = new Date()

async function signIn(req, res) {
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

	if(req.body) {
		// yyyy-mm-dd
		const FORMAT_DATE = `${ DATE.getFullYear() }-`+
		`${ (String(DATE.getMonth()+1).length == 1) ? '0'+(DATE.getMonth()+1) : DATE.getMonth()+1 }-`+
		`${ (String(DATE.getDate()).length == 1) ? '0'+(DATE.getDate()) : DATE.getDate() }`
		// hh:mm
		const FORMAT_HOUR = `${ (String(DATE.getHours()).length == 1) ? '0'+(DATE.getHours()) : DATE.getHours() }:`+
		`${ (String(DATE.getMinutes()).length == 1) ? '0'+(DATE.getMinutes()) : DATE.getMinutes() }`

		/**
		 * Getting fuzzy: This function works like if there isn't the records that we're searching
		 * in the collection then insert it and get the ID and return it.
		 * Else, if the records exists get its ID and return it as a reference to avoid duplications.
		 */ 
		const getFuzzy = async(query, collection) => {
			if(!isNaN(parseInt(query)))
				return query
			
			query = String(query).trim()

			let modelMaster

			// Select model
			if(collection == 'area')
				modelMaster = modelArea
			if(collection == 'direction')
				modelMaster = modelDirection
			if(collection == 'category')
				modelMaster = modelCategory
			if(collection == 'position')
				modelMaster = modelPosition

			// Fuzzy search (this method skips all the vowels because there's no insensitive diacritic)
			// This gets if there is the record that we're are searching already in the collection or not
			let data = await fuzzy({ query: query, collection: collection }).catch(error => {
				console.log(error)
				return res.end(JSON.stringify({
					msg: [
						`No se pudo leer la columna ${collection}.`,
						`Could not read the ${collection}.`
					],
					status: 404,
					noti: true
				}))
			})

			let block = true
			if(data) { // If the search found the same word, then get the ID
				for(let recFound in data) {
					if(data[recFound].description[0] == query) {
						block = false
						return data[recFound]._id
					}
				}
			}

			if(block) {
				// Else, first get the last ID or assign the ID as "1" for the first record
				let m = await modelMaster.find({}).countDocuments({},{})
				let insertNew = {
						_id: m+1,
						description: [ query, query ]
					}
	
				// After insert the document, get the ID and return it
				const ID = await new modelMaster(insertNew).save()
				.catch(error => {
					console.log(error)
					return res.end(JSON.stringify({
						msg: [
							`No se pudo leer la columna ${collection}.`,
							`Could not read the ${collection}.`
						],
						status: 404,
						noti: true
					}))
				})
				return ID['_id']
			}


			// Function with promises (don't work 😥)
			// TODO: Delete this!!!
			/*fuzzy({ query: query, collection: collection })
			.then(data => {
				if(data) result = data._id 
				else {
					modelMaster.aggregate([
						{ $sort: { _id: -1} },
						{ $limit: 1 },
						{ $project: { _id: 1 } }
					])
					.then(id => {
						let insertNew = {
							_id: (id.length) ? parseInt(id[0]._id)+1 : 1,
							description: [ query, query ]
						}
	
						new modelMaster(insertNew).save()
						.then(data => {
							result = data._id
						})
						.catch(error => {
							console.log(error)
							return res.end(JSON.stringify({
								msg: [
									`No se pudo leer la columna ${'area'}.`,
									`Could not read the ${'area'}.`
								],
								status: 404,
								noti: true
							}))
						})
					})
					.catch(error => {
						console.log(error)
						return res.end(JSON.stringify({
							msg: [
								`No se pudo leer la columna ${'area'}.`,
								`Could not read the ${'area'}.`
							],
							status: 404,
							noti: true
						}))
					})
				}
			})
			.catch(error => {
				console.log(error)
				return res.end(JSON.stringify({
					msg: [
						`No se pudo leer la columna ${'area'}.`,
						`Could not read the ${'area'}.`
					],
					status: 404,
					noti: true
				}))
			})
			.finally(() => {
				return result
			})*/
		}

		req.body['log'] = {
			_id: req.session._id,
			name: req.session.name,
			timestamp: {
				date: FORMAT_DATE,
				time: FORMAT_HOUR
			},
			operation: 'created'
		}

		for(let data in req.body.data) {
			//SignIn validator
			await modelUserInfo.find({ _id: ('fields' in req.body) ? req.body.data[data][req.body.fields._id] : req.body.data[data]._id }, { _id: 1 })
			.then(async(dataUser) => {
				let model = {
					_id: ('fields' in req.body) ? req.body.data[data][req.body.fields._id] : req.body.data[data]._id,
					name: ('fields' in req.body) ? req.body.data[data][req.body.fields.name] : req.body.data[data].name,
					area: ('fields' in req.body) ? req.body.data[data][req.body.fields.area] : req.body.data[data].area,
					direction: ('fields' in req.body) ? req.body.data[data][req.body.fields.direction] : req.body.data[data].direction,
					position: ('fields' in req.body) ? req.body.data[data][req.body.fields.position] : req.body.data[data].position,
					category: ('fields' in req.body) ? req.body.data[data][req.body.fields.category] : req.body.data[data].category,
					// blame system™ 😎
					log: req.body.log
				}

				model['area'] = await getFuzzy(model['area'], 'area')
				model['direction'] = await getFuzzy(model['direction'], 'direction')
				model['position'] = await getFuzzy(model['position'], 'position')
				model['category'] = await getFuzzy(model['category'], 'category')

				if('manager' in req.body.data[data])
					req.body.data[data] = {
						manager: ('fields' in req.body)
						? req.body.data[data][req.body.fields.manager]
						: req.body.data[data].manager
					}

				if(dataUser.length) { // If the user exists
					if('as_user' in req.body.data[data]) {
						// Encryption
						model['pass'] = crypto.AES.encrypt('password', model._id).toString()

						// If user_info exits then save a new user for that employee
						new modelUser(model).save()
						.then((user) => { //🟢
							return res.end(JSON.stringify({
								msg: [
									`¡Usuario para ${dataUser[0].name } creado correctamente!`,
									`User for ${dataUser[0].name } created successfully!`
								],
								status: 200,
								noti: true
							}))
						})
						.catch((error) => { //🔴
							return res.end(JSON.stringify({
								msg: ['Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
									'Unable to register user. Please try again later.'],
								status: 500,
								noti: true
							}))
						})
					} else
						return res.end(JSON.stringify({
							msg: ['¡Ya existe usuario con ese ID!', 'There is an user with that ID already!'],
							status: 409,
							noti: true
						}))
				} else {
					// Save a new info_user
					new modelUserInfo(model).save()
					.then(() => { //🟢
						// And if the employee is a user
						if('as_user' in req.body.data[data]) {
							new modelUser(model).save()
							.then((user) => { //🟢
								return res.end(JSON.stringify({
									msg: ['¡Registrado correctamente!', 'Successfully registered!'],
									status: 200,
									noti: true
								}))
							})
							.catch((error) => { //🔴
								return res.end(JSON.stringify({
									msg: [
										'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
										'Unable to register user. Please try again later.'
									],
									status: 500,
									noti: true
								}))
							})
						} else
							return res.end(JSON.stringify({
								msg: ['¡Registrado correctamente!', 'Successfully registered!'],
								status: 200,
								noti: true
							}))
					})
					.catch((error) => { //🔴
						console.log(error)
						return res.end(JSON.stringify({
							msg: [
								'No se puede registrar usuario. Inténtalo más tarde.',
								'Unable to register user. Please try again later.'
							],
							status: 500,
							noti: true
						}))
					})
				}
			})
			.catch((error) => { //if error 🤬
				console.log(error)
				return res.end(JSON.stringify({
					msg: ['Error en servidor.', 'Server error'],
					status: 500,
					noti: true
				}))
			})
		}
	} else return res.end(JSON.stringify({
		status: 418,
		error: ['Sin datos', 'Without data'],
		noti: true
	}))
}

async function getManager(req, res) {
	let search

	if(parseInt(req.query.category) == 1) {
		search = { level: parseInt(req.query.category) }
	} else if(req.query.direction > 0) {
		search = {
			area: parseInt(req.query.area),
			level: parseInt(req.query.category)
		}
	} else if(req.query.position > 0) {
		search = {
			area: parseInt(req.query.area),
			department: parseInt(req.query.direction),
			level: parseInt(req.query.category)
		}
	} else {
		search = {
			area: parseInt(req.query.area),
			department: parseInt(req.query.direction),
			career: parseInt(req.query.position),
			level: parseInt(req.query.category)
		}
	}

	await modelUserInfo.find(search)
	.then((data) => { //🟢
		let info = []

		for(i in data) {
			info[i] = {
				_id: data[i]._id,
				level: data[i].category,
				name: data[i].name,
			}
		}

		return res.end(JSON.stringify({
			data: info,
			status: 200,
			noti: true
		}))
	})
	.catch((error) => { //if error 🤬
		console.log('Error:',error)
		return res.end(JSON.stringify({
			msg: 'Error en servidor.',
			status: 500,
			noti: true
		}))
	})
}

module.exports = {
	signIn,
	getManager,
}