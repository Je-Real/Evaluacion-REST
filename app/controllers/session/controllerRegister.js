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

	const lang = req.session.lang // 0 means Spanish, 1 English

	if(req.body) {
		// yyyy-mm-dd
		const FORMAT_DATE = `${ DATE.getFullYear() }-`+
		`${ (String(DATE.getMonth()+1).length == 1) ? '0'+(DATE.getMonth()+1) : DATE.getMonth()+1 }-`+
		`${ (String(DATE.getDate()).length == 1) ? '0'+(DATE.getDate()) : DATE.getDate() }`
		// hh:mm
		const FORMAT_HOUR = `${ (String(DATE.getHours()).length == 1) ? '0'+(DATE.getHours()) : DATE.getHours() }:`+
		`${ (String(DATE.getMinutes()).length == 1) ? '0'+(DATE.getMinutes()) : DATE.getMinutes() }`

		/**
		 * Fuzzy search: This function works like if there isn't the records that we're searching
		 * in the collection then insert it and get the ID and return it.
		 * Else, if the records exists get its ID and return it as a reference to avoid duplications.
		 *
		 * @param {String} query
		 * @param {String} collection
		 * @returns
		**/
		const getFuzzy = async(query, collection) => {
			if(!isNaN(parseInt(query)) || query == undefined)
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
						console.error(error)
						throw res.json({
							msg: Array(
								`No se pudo leer la columna ${collection}.`,
								`Could not read the ${collection}.`
							)[lang],
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
					)[lang],
					status: 404,
					snack: true
				})
			})
			.catch(error => {
				console.error(error)
				throw res.json({
					msg: Array(
						`No se pudo leer la columna ${collection}.`,
						`Could not read the ${collection}.`
					)[lang],
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
			let header = (lang == 0) // Choose header by language
				? ['_id', 'name', 'system_user', 'pass', 'information_user', 'error']
				: ['_id', 'nombre', 'usuario_de_sistema', 'clave', 'informacion_de_usurio', 'error']

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
					.catch(error => console.error(error))
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
		let regLog = { length: req.body.data.length, users: [] },
			isFile = (req.body.data.length > 1),
			model

		res.append('filename', Array(
			`lista-registro-${FORMAT_DATE}-${DATE.getHours()}-${DATE.getMinutes()}.xlsx`,
			`registry-log-${FORMAT_DATE}-${DATE.getHours()}-${DATE.getMinutes()}.xlsx`
		)[lang])
		res.append('snack', 'true')

		/**
		 * Creates a new system user from an ID and save 
		 * the result in regLog variable
		 * @param {String} _id ID
		 * @param {Number} dataIterator Number in the regLog array
		 * @param {*} dataUser User data retrieved from a query (name)
		 * @returns regLog record
		 */
		 const createSysUser = async(_id, dataIterator, dataUser) => {
			return await modelUser.findOne({ _id: _id }, { _id: 1 })
			.then(async(sys_user) => {
				if(sys_user) {
					regLog.users[dataIterator]['error'] = Array(
						'¡Ya existe usuario del sistema con ese ID!',
						'There is a system user with that ID already!'
					)[lang]

					if(!isFile) {
						res.append('msg', Array(
							'¡Ya existe usuario del sistema con ese ID!',
							'There is a system user with that ID already!'
						)[lang])
						return res.status(409).send(await saveAsExcel(regLog.users))
					} else if(isFile && data >= (regLog.length-1)) {
						res.append('msg', Array(
							'Se completo el registro con algunas fallas. Por favor, Revise en el archivo descargado.',
							'The registration is complete with some errors. Check in the downloaded file.'
						)[lang])
						return res.status(409).send(await saveAsExcel(regLog.users))
					}
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
						regLog.users[dataIterator]['system_user'] = Array(
							'Usuario creado',
							'User created'
						)[lang]
						regLog.users[dataIterator]['pass'] = password

						if(!isFile) {
							res.append('msg', Array(
								`¡Usuario para ${dataUser.name } creado correctamente!`,
								`User for ${dataUser.name } created successfully!`
							)[lang])
							res.status(200).send(await saveAsExcel(regLog.users))
						} else if(isFile && data >= (regLog.length-1)) {
							res.append('msg', Array(
								`!Proceso de registro completado correctamente!`,
								`Registration process successfully completed!`
							)[lang])
							res.status(200).send(await saveAsExcel(regLog.users))
						}
					})
					.catch(async(error) => { //🔴
						console.error(error)
						regLog.users[dataIterator]['system_user'] = Array(
							'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
							'Unable to register user. Please try again later.'
						)[lang]
						regLog.users[dataIterator]['error'] = error

						if((isFile && data >= (regLog.length-1)) || !isFile) {
							res.append('msg', Array(
								'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
								'Unable to register user. Please try again later.'
							)[lang])
							res.status(500).send(await saveAsExcel(regLog.users))
						}
					})
				}
			})
			.catch(async(error) => { //🔴
				console.error(error)
				regLog.users[parseInt(data)]['system_user'] = Array(
						'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
						'Unable to register user. Please try again later.'
					)[lang]
				regLog.users[parseInt(data)]['error'] = error

				if((isFile && data >= (regLog.length-1)) || !isFile) {
					res.append('msg', Array(
						'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
						'Unable to register user. Please try again later.'
					)[lang])
					return res.status(500).send(await saveAsExcel(regLog.users))
				}
			})
		}

		for(let iterator in req.body.data) {
			const i = parseInt(iterator)

			// regLog will be returned as a file log in excel for each operation
			regLog.users[i] = {
				_id: ('fields' in req.body) ? req.body.data[iterator][req.body.fields._id] : req.body.data[iterator]._id,
			}
			regLog.users[i]['name'] = ('fields' in req.body)
				? req.body.data[iterator][req.body.fields.name]
				: req.body.data[iterator].name
			regLog.users[i]['system_user'] = Array('Omitido', 'Skipped')[lang]
			regLog.users[i]['pass'] = Array('Omitido', 'Skipped')[lang]
			regLog.users[i]['information_user'] = Array('Omitido', 'Skipped')[lang]
			regLog.users[i]['error'] = ''

			// Sign in validator
			await modelUserInfo.findOne(
				{ _id: ('fields' in req.body) ? req.body.data[iterator][req.body.fields._id] : req.body.data[iterator]._id },
				{ _id: 1 }
			)
			.then(async(dataUser) => {
				model = { // Structure compatible with the all the models used
					/**
					 * If in the body there is a 'fields' it means that a file was uploaded,
					 * then the data of the columns of the excel will be with a custom name
					 * and we'll retrieving the data with the custom name instead of the
					 * expected
					**/
					_id: ('fields' in req.body) ? req.body.data[iterator][req.body.fields._id] : req.body.data[iterator]._id,
					name: ('fields' in req.body) ? req.body.data[iterator][req.body.fields.name] : req.body.data[iterator].name,
					area: ('fields' in req.body) ? req.body.data[iterator][req.body.fields.area] : req.body.data[iterator].area,
					direction: ('fields' in req.body) ? req.body.data[iterator][req.body.fields.direction] : req.body.data[iterator].direction,
					position: ('fields' in req.body) ? req.body.data[iterator][req.body.fields.position] : req.body.data[iterator].position,
					category: ('fields' in req.body) ? req.body.data[iterator][req.body.fields.category] : req.body.data[iterator].category,
					manager: ('fields' in req.body)
						? req.body.data[iterator][req.body.fields.manager]
						: ('manager' in req.body.data[iterator])
							? req.body.data[iterator].manager
							: '-1',
					// blame system™ 😎
					log: req.body.log
				}, nextStep = true, errorGetter = null

				/**
				 * Fuzzy search all the posible data that can be duplicated
				 * Create a document if, for example, the area isn't in the
				 * db and get its ID, but it matches with an already in db
				 * area, then just get its ID
				**/
				if(model.area != undefined)
					model['area'] = await getFuzzy(model['area'], 'area').then(fuzzID => {
						if(parseInt(fuzzID) > 0) return parseInt(fuzzID)
						else nextStep = false
					}).catch(error => {console.error(error); nextStep = false; errorGetter = error})
				if(model.direction != undefined)
					model['direction'] = await getFuzzy(model['direction'], 'direction').then(fuzzID => {
						if(parseInt(fuzzID) > 0) return parseInt(fuzzID)
						else nextStep = false
					}).catch(error => {console.error(error); nextStep = false; errorGetter = error})
				if(model.position != undefined)
					model['position'] = await getFuzzy(model['position'], 'position').then(fuzzID => {
						if(parseInt(fuzzID) > 0) return parseInt(fuzzID)
						else nextStep = false
					}).catch(error => {console.error(error); nextStep = false; errorGetter = error})
				if(model.category != undefined)
					model['category'] = await getFuzzy(model['category'], 'category').then(fuzzID => {
						if(parseInt(fuzzID) > 0) return parseInt(fuzzID)
						else nextStep = false
					}).catch(error => {console.error(error); nextStep = false; errorGetter = error})

				if(nextStep) {
					if('manager' in req.body.data[iterator])
						req.body.data[iterator] = {
							manager: ('fields' in req.body)
							? req.body.data[iterator][req.body.fields.manager]
							: req.body.data[iterator].manager
						}

					if(dataUser) { // If the user exists
						if('find_user' in req.body.data[iterator]) { // If there is 'find_user'
							return createSysUser(model._id, i, dataUser) // Create system user
						} else {
							regLog.users[i]['error'] = Array(
								'¡Ya existe información de usuario con ese ID!',
								'There is an system user with that ID already!'
							)[lang]

							if(!isFile) {
								res.append('msg', Array(
									'¡Ya existe información de usuario con ese ID!',
									'There is an system user with that ID already!'
								)[lang])
								return res.status(409).send(await saveAsExcel(regLog.users))
							} else if(isFile && iterator >= (regLog.length-1)) {
								res.append('msg', Array(
									'Se completo el registro con algunas fallas. Por favor, Revise en el archivo descargado.',
									'The registration is complete with some errors. Check in the downloaded file.'
								)[lang])
								return res.status(409).send(await saveAsExcel(regLog.users))
							}
						}
					} else { // Save a new information_user
						new modelUserInfo(model).save()
						.then(async() => { //🟢
							regLog.users[i]['information_user'] = Array(
								'Información guardada',
								'Information saved'
							)[lang]

							// And if the employee is a system user
							if('new_user' in req.body.data[iterator]) {
								return createSysUser(model._id, i, dataUser)
							} else{
								if(!isFile) {
									res.append('msg', Array(
										`¡Información registrada correctamente!`,
										`Information successfully recorded!`
									)[lang])
									return res.status(200).send(await saveAsExcel(regLog.users))
								} else if(isFile && iterator >= (regLog.length-1)) {
									res.append('msg', Array(
										`!Proceso de registro completado correctamente!`,
										`Registration process successfully completed!`
									)[lang])
									return res.status(200).send(await saveAsExcel(regLog.users))
								}
							}
						})
						.catch(async(error) => { //🔴
							console.error(error)
							regLog.users[i]['information_user'] = Array(
									'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
									'Unable to register user. Please try again later.'
								)[lang]
							regLog.users[i]['error'] = error

							if((isFile && iterator >= (regLog.length-1)) || !isFile) {
								res.append('msg', Array(
									'Proceso con errores. Revisa en el archivo descargado.',
									'Process with errors. Check in the downloaded file.'
								)[lang])
								return res.status(500).send(await saveAsExcel(regLog.users))
							}
						})
					}
				} else {
					regLog.users[i]['information_user'] = Array(
						'Se detectó error en la búsqueda dinámica. Por favor, revise el archivo descargado',
						'An error was detected in the dynamic search. Please check the downloaded file.'
					)[lang]
					regLog.users[i]['error'] = errorGetter

					if(!isFile) {
						res.append('msg', Array(
							'Se detectó error en la búsqueda dinámica. Por favor, revise el archivo descargado',
							'An error was detected in the dynamic search. Please check the downloaded file.'
						)[lang])
						return res.status(409).send(await saveAsExcel(regLog.users))
					} else if(isFile && iterator >= (regLog.length-1)) {
						res.append('msg', Array(
							'Se completo el registro con algunas fallas. Por favor, Revise en el archivo descargado.',
							'The registration is complete with some errors. Check in the downloaded file.'
						)[lang])
						return res.status(409).send(await saveAsExcel(regLog.users))
					}
				}
			})
			.catch(async(error) => { //if error 🤬
				console.error(error)
				regLog.users[i]['error'] = error

				if((isFile && iterator >= (regLog.length-1)) || !isFile) {
					res.append('msg', Array(
						'Error en servidor. Revisa en el archivo descargado.',
						'Server error. Check in the downloaded file.'
					)[lang])
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
		console.error('Error:',error)
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