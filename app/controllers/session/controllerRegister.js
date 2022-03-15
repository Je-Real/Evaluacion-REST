const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')

const modelArea = require('../../models/modelArea')
const modelDirection = require('../../models/modelDirection')
const modelCategory = require('../../models/modelCategory')
const modelPosition = require('../../models/modelPosition')

const fuzzy = require('../util/util').fuzzySearch

const crypto = require('crypto-js')
const XLSXPopulate = require('xlsx-populate')

const DATE = new Date()

async function signIn(req, res) {
	if(!('_id' in req.session)) {
		res.append('msg', Array(
			`Por favor, inicia sesión nuevamente`,
			`Please, log in again`
		))
		res.append('snack', 'true')
		return res.status(401).end()
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
			return await fuzzy({ query: query, collection: collection })
			.then(async(data) => {
				let pass = true
				if(data) { // If the search found the same word, then get the ID
					for(let recFound in data) {
						if( String(data[recFound].description[0]).length == query.length ||
							data[recFound].description[0] == query
						) {
							pass = false
							return data[recFound]._id
						}
					}
				}

				if(pass) {
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
						throw res.json({
							msg: Array(
								`No se pudo leer la columna ${collection}.`,
								`Could not read the ${collection}.`
							)[req.session.lang],
							status: 404,
							snack: true
						})
					})

					return ID['_id']
				} else 
				throw res.json({
					msg: Array(
						`No se pudo leer la columna ${collection}.`,
						`Could not read the ${collection}.`
					)[req.session.lang],
					status: 404,
					snack: true
				})
			})
			.catch(error => {
				console.log(error)
				throw res.json({
					msg: Array(
						`No se pudo leer la columna ${collection}.`,
						`Could not read the ${collection}.`
					)[req.session.lang],
					status: 404,
					snack: true
				})
			})

		}

		const getSheetData = (data, header) => {
			let fields = Object.keys(data[0])
			let sheetData = data.map((row) => {
				return fields.map((fieldName) => {
					return (String(row[fieldName]).length != 0) ? row[fieldName] : ''
				})
			})
			sheetData.unshift(header)
			return sheetData
		}
		const saveAsExcel = async(log) => {
			let header = ['_id', 'name', 'system_user', 'pass', 'info_user', 'error']

			return await XLSXPopulate.fromBlankAsync().then(async (workbook) => {
				const sheet1 = workbook.sheet(0)
				const sheetData = getSheetData(log, header)
				const totalColumns = sheetData[0].length

				sheet1.cell('A1').value(sheetData)
				const range = sheet1.usedRange()
				const endColumn = String.fromCharCode(64 + totalColumns)
				sheet1.row(1).style('bold', true)
				sheet1.range('A1:' + endColumn + '1').style('fill', 'BFBFBF')
				range.style('border', true)
				return await workbook.outputAsync()
					.catch(error => console.log(error))
			})
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
		let regLog = { length: req.body.data.length, users: [] }
		let isFile = (req.body.data.length > 1)

		res.append('filename', Array(
			`lista-registro-${FORMAT_DATE}-${DATE.getHours()}-${DATE.getMinutes()}.xlsx`,
			`registry-log-${FORMAT_DATE}-${DATE.getHours()}-${DATE.getMinutes()}.xlsx`
		)[req.session.lang])
		res.append('snack', 'true')

		for(let data in req.body.data) {
			regLog.users[parseInt(data)] = {
				_id: ('fields' in req.body) ? req.body.data[data][req.body.fields._id] : req.body.data[data]._id,
				name: ('fields' in req.body) ? req.body.data[data][req.body.fields.name] : req.body.data[data].name,
				system_user: false,
				pass: false,
				info_user: false,
				error: ''
			}

			// Sign in validator
			await modelUserInfo.find(
				{ _id: ('fields' in req.body) ? req.body.data[data][req.body.fields._id] : req.body.data[data]._id },
				{ _id: 1 }
			)
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
				}, nextStep = true

				model['area'] = await getFuzzy(model['area'], 'area').then(data => {
					if(parseInt(data) > 0) return parseInt(data)
					else nextStep = false
				}).catch(error => {console.log(error); nextStep = false})
				model['direction'] = await getFuzzy(model['direction'], 'direction').then(data => {
					if(parseInt(data) > 0) return parseInt(data)
					else nextStep = false
				}).catch(error => {console.log(error); nextStep = false})
				model['position'] = await getFuzzy(model['position'], 'position').then(data => {
					if(parseInt(data) > 0) return parseInt(data)
					else nextStep = false
				}).catch(error => {console.log(error); nextStep = false})
				model['category'] = await getFuzzy(model['category'], 'category').then(data => {
					if(parseInt(data) > 0) return parseInt(data)
					else nextStep = false
				}).catch(error => {console.log(error); nextStep = false})

				if(nextStep) {
					if('manager' in req.body.data[data])
						req.body.data[data] = {
							manager: ('fields' in req.body)
							? req.body.data[data][req.body.fields.manager]
							: req.body.data[data].manager
						}
	
					if(dataUser.length) { // If the user exists
						if('find_user' in req.body.data[data]) {
							modelUser.findOne({ _id: model._id }, { _id: 1 })
							.then(async(sys_user) => {
								if(sys_user) {
									if(!isFile) {
										res.append('msg', Array(
											'¡Ya existe usuario con ese ID!',
											'There is an user with that ID already!'
										)[req.session.lang])
									} else if(isFile && data >= (regLog.length-1)) {
										res.append('msg', Array(
											'Se completo el registro con algunas fallas. Revise en el archivo descargado.',
											'The registration is complete with some errors. Check in the downloaded file.'
										)[req.session.lang])
									}
									regLog.users[parseInt(data)]['error'] = Array(
										'¡Ya existe usuario con ese ID!',
										'There is an user with that ID already!'
									)[req.session.lang]
									return res.status(409).send(await saveAsExcel(regLog.users))
								} else {
									let chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$()ABCDEFGHIJKLMNOPQRSTUVWXYZ',
										passwordLength = 8,
										password = ''
	
									for(let i = 0; i <= passwordLength; i++) {
										let randomNumber = Math.floor(Math.random() * chars.length)
										password += chars.substring(randomNumber, randomNumber+1)
									}
									// Encryption
									model['pass'] = crypto.AES.encrypt(password, model._id).toString()
	
									// If user_info exits then save a new user for that employee
									new modelUser(model).save()
									.then(async() => { //🟢
										regLog.users[parseInt(data)]['system_user'] = true
										regLog.users[parseInt(data)]['password'] = password
	
										if(!isFile) {
											res.append('msg', Array(
												`¡Usuario para ${dataUser[0].name } creado correctamente!`,
												`User for ${dataUser[0].name } created successfully!`
											)[req.session.lang])
										} else if(isFile && data >= (regLog.length-1)) {
											res.append('msg', Array(
												`!Proceso de registro completado correctamente!`,
												`Registration process successfully completed!`
											)[req.session.lang])
										}
										res.status(200).send(await saveAsExcel(regLog.users))
									})
									.catch(async(error) => { //🔴
										console.log(error)
										regLog.users[parseInt(data)]['system_user'] = Array(
											'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
											'Unable to register user. Please try again later.'
										)[req.session.lang]
										regLog.users[parseInt(data)]['error'] = error
	
										if((isFile && data >= (regLog.length-1)) || !isFile) {
											res.append('msg', Array(
												'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
												'Unable to register user. Please try again later.'
											)[req.session.lang])
											res.status(500).send(await saveAsExcel(regLog.users))
										}
									})
								}
							})
							.catch(async(error) => { //🔴
								console.log(error)
								regLog.users[parseInt(data)]['system_user'] = Array(
										'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
										'Unable to register user. Please try again later.'
									)[req.session.lang]
								regLog.users[parseInt(data)]['error'] = error
	
								if((isFile && data >= (regLog.length-1)) || !isFile) {
									res.append('msg', Array(
										'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
										'Unable to register user. Please try again later.'
									)[req.session.lang])
									return res.status(500).send(await saveAsExcel(regLog.users))
								}
							})
						} else {
							if(!isFile) {
								res.append('msg', Array(
									'¡Ya existe usuario con ese ID!',
									'There is an user with that ID already!'
								)[req.session.lang])
							} else if(isFile && data >= (regLog.length-1)) {
								res.append('msg', Array(
									'Se completo el registro con algunas fallas. Revise en el archivo descargado.',
									'The registration is complete with some errors. Check in the downloaded file.'
								)[req.session.lang])
							}
							regLog.users[parseInt(data)]['error'] = Array(
								'¡Ya existe usuario con ese ID!',
								'There is an user with that ID already!'
							)[req.session.lang]
							return res.status(409).send(await saveAsExcel(regLog.users))
						}
					} else {
						// Save a new info_user
						new modelUserInfo(model).save()
						.then(async() => { //🟢
							// And if the employee is a user
							regLog.users[parseInt(data)]['info_user'] = true
	
							if('new_user' in req.body.data[data]) {
								new modelUser(model).save()
								.then(async() => { //🟢
									regLog.users[parseInt(data)]['system_user'] = true
	
									if(!isFile) {
										res.append('msg', Array(
											`¡Información registrada correctamente!`,
											`Information successfully recorded!`
										)[req.session.lang])
									} else if(isFile && data >= (regLog.length-1)) {
										res.append('msg', Array(
											`!Proceso de registro completado correctamente!`,
											`Registration process successfully completed!`
										)[req.session.lang])
									}
									return res.status(200).send(await saveAsExcel(regLog.users))
								})
								.catch(async() => { //🔴
									console.log(error)
									regLog.users[parseInt(data)]['system_user'] = Array(
											'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
											'Unable to register user. Please try again later.'
										)[req.session.lang]
									regLog.users[parseInt(data)]['error'] = error
	
									if((isFile && data >= (regLog.length-1)) || !isFile) {
										res.append('msg', Array(
											'Proceso con errores. Revisa en el archivo descargado.',
											'Process with errors. Check in the downloaded file.'
										)[req.session.lang])
										return res.status(500).send(await saveAsExcel(regLog.users))
									}
								})
							} else{
								if(!isFile) {
									res.append('msg', Array(
										`¡Información registrada correctamente!`,
										`Information successfully recorded!`
									)[req.session.lang])
								} else if(isFile && data >= (regLog.length-1)) {
									res.append('msg', Array(
										`!Proceso de registro completado correctamente!`,
										`Registration process successfully completed!`
									)[req.session.lang])
								}
								return res.status(200).send(await saveAsExcel(regLog.users))
							}
						})
						.catch(async(error) => { //🔴
							console.log(error)
							regLog.users[parseInt(data)]['info_user'] = Array(
									'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
									'Unable to register user. Please try again later.'
								)[req.session.lang]
							regLog.users[parseInt(data)]['error'] = error
	
							if((isFile && data >= (regLog.length-1)) || !isFile) {
								res.append('msg', Array(
									'Proceso con errores. Revisa en el archivo descargado.',
									'Process with errors. Check in the downloaded file.'
								)[req.session.lang])
								return res.status(500).send(await saveAsExcel(regLog.users))
							}
						})
					}
				} else return res.status(200).end({})
			})
			.catch(async(error) => { //if error 🤬
				console.log(error)
				regLog.users[parseInt(data)]['error'] = error

				if((isFile && data >= (regLog.length-1)) || !isFile) {
					res.append('msg', Array(
						'Error en servidor. Revisa en el archivo descargado.',
						'Server error. Check in the downloaded file.'
					)[req.session.lang])
					return res.status(500).send(await saveAsExcel(regLog.users))
				}
			})
		}
	} else return res.json({
		status: 418,
		error: ['Sin datos', 'Without data'],
		snack: true
	})
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

		return res.json({
			data: info,
			status: 200,
			snack: true
		})
	})
	.catch((error) => { //if error 🤬
		console.log('Error:',error)
		return res.json({
			msg: 'Error en servidor.',
			status: 500,
			snack: true
		})
	})
}

async function fuzzySearch(req, res) {
	await fuzzy({ query: req.body.query, collection: req.body.collection })
	.then(async(data) => {
		return res.json({
			data: data,
			status: 200
		})
	})
	.catch(error => {
		return res.json({
			msg: [
				`No se pudo leer la columna ${collection}.`,
				`Could not read the ${collection}.`
			],
			status: 404,
			snack: true
		})
	})
}

module.exports = {
	signIn,
	getManager,
	fuzzySearch,
}