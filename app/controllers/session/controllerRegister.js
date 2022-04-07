const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')

const modelArea = require('../../models/modelArea')
const modelDirectorate = require('../../models/modelDirectorate')
const modelCategory = require('../../models/modelCategory')
const modelPosition = require('../../models/modelPosition')

const modelEvaluation = require('../../models/modelEvaluation')

const fuzzy = require('../util/fuzzy').fuzzySearch

const crypto = require('crypto-js')
const XLSXPopulate = require('xlsx-populate')

const DATE = new Date()

/**
 * Register function
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function signUp(req, res) {
	if(!('_id' in req.session)) {
		res.append('msg', `Por favor, inicia sesión nuevamente | Please, log in again`)
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
			if(collection == 'directorate')
				modelMaster = modelDirectorate
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

		/**
		 * IDK but this function put the information in
		 * the excel file in the array order position
		 * @param {*} data Data
		 * @param {*} header Header array
		 * @returns Data sheet
		 */
		const getSheetData = (data, header) => {
			let fields = Object.keys(data[0])
			let sheetData = data.map((row) => {
				return fields.map((fieldName) => {
					return (String(row[fieldName]).length != 0) ? String(row[fieldName]) : ''
				})
			})
			sheetData.unshift(header)
			return sheetData
		}
		/**
		 * Saves the log output as an excel file
		 * @param {*} log regLog variable
		 * @returns File buffer
		 */
		const saveAsExcel = async(log) => {
			let header = Array( // Choose header by language
				['_id', 'nombre', 'usuario_de_sistema', 'clave_de_acceso', 'informacion_de_usuario', 'error'],
				['_id', 'name', 'system_user', 'pass', 'information_user', 'error']
			)[lang]

			return await XLSXPopulate.fromBlankAsync().then(async (workbook) => {
				const sheet = workbook.sheet(0)
				const sheetData = getSheetData(log, header)
				const totalColumns = sheetData[0].length

				sheet.column('A').width(7)
				sheet.column('B').width(55)
				sheet.column('C').width(25)
				sheet.column('D').width(25)
				sheet.column('E').width(25)
				sheet.column('F').width(50)

				sheet.cell('A1').value(sheetData)
				const range = sheet.usedRange()
				const endColumn = String.fromCharCode(64 + totalColumns)
				sheet.row(1).style('bold', true)
				sheet.range('A1:' + endColumn + '1').style('fill', 'BFBFBF')
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
			model = {}

		res.append('filename', Array(
			`lista-registro-${FORMAT_DATE}-${DATE.getHours()}-${DATE.getMinutes()}.xlsx`,
			`registry-log-${FORMAT_DATE}-${DATE.getHours()}-${DATE.getMinutes()}.xlsx`
		)[lang])
		res.append('snack', 'true')

		/**
		 * Creates a new system user from an ID and save 
		 * the result in regLog variable
		 * @param {String} _id ID
		 * @param {Number} i Number in the regLog array
		 * @param {String} name User name retrieved from the query (or model)
		 * @returns regLog record
		 */
		const createSysUser = async(_id, i, name) => {
			return modelUser.findOne({ _id: _id }, { _id: 1 })
			.then(async(sysUser) => {
				if(sysUser != null) {
					regLog.users[i]['error'] = Array(
						'¡Ya existe usuario del sistema con ese ID!',
						'There is a system user with that ID already!'
					)[lang]

					if(!isFile) {
						res.append('msg', Array(
							'¡Ya existe usuario del sistema con ese ID!',
							'There is a system user with that ID already!'
						)[lang])
						return res.status(409).send(await saveAsExcel(regLog.users))
					} else if(isFile && i >= (regLog.length-1)) {
						res.append('msg', Array(
							'Se completo el registro con algunos usuarios duplicados. Por favor, Revise en el archivo descargado.',
							'The registration is complete with some duplicated users. Check in the downloaded file.'
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
					await new modelUser(model).save()
					.then(async(save) => { //🟢
						regLog.users[i][Array('system_user', 'usuario_de_sistema')[lang]] = Array(
							'Usuario creado',
							'User created'
						)[lang]
						regLog.users[i][Array('pass', 'clave_de_acceso')[lang]] = password

						if(!isFile) {
							res.append('msg', Array(
								`¡Usuario para ${ name } creado correctamente!`,
								`User for ${ name } created successfully!`
							)[lang])
							res.status(200).send(await saveAsExcel(regLog.users))
						} else if(isFile && i >= (regLog.length-1)) {
							res.append('msg', Array(
								`!Proceso de registro completado correctamente!`,
								`Registration process successfully completed!`
							)[lang])
							res.status(200).send(await saveAsExcel(regLog.users))
						}
					})
					.catch(async(error) => { //🔴
						console.error(error)
						regLog.users[i][Array('system_user', 'usuario_de_sistema')[lang]] = Array(
							'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
							'Unable to register user. Please try again later.'
						)[lang]
						regLog.users[i]['error'] = error

						if((isFile && i >= (regLog.length-1)) || !isFile) {
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
				regLog.users[i][Array('system_user', 'usuario_de_sistema')[lang]] = Array(
						'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
						'Unable to register user. Please try again later.'
					)[lang]
				regLog.users[i]['error'] = error

				if((isFile && i >= (regLog.length-1)) || !isFile) {
					res.append('msg', Array(
						'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
						'Unable to register user. Please try again later.'
					)[lang])
					return res.status(500).send(await saveAsExcel(regLog.users))
				}
			})
		}

		const addEvalRecords = async(model, i) => { // Test
			return await modelEvaluation.aggregate([
				{
					'$match': {
						'_id': model._id
					}
				}, {
					'$project': {'_id': 1}
				}
			])
			.then(async(evalID) => {
				if(evalID[0]) {
					return await modelEvaluation.aggregate([
						{
							'$match': {
								'_id': model._id,
								'records.year': model["evaluations-records"].year
							}
						}, {
							'$unwind': '$records'
						}, {
							'$match': {
								'records.year': model["evaluations-records"].year
							}
						}
					])
					.then((evalData) => {
						if(evalData.length) {
							modelEvaluation.updateOne(
								{ _id: model._id }, {
									 $set: {
										"records.$[elem]" : model["evaluations-records"]
									  }
								}, {
									arrayFilters: [
										{ "elem.year": { $eq: model["evaluations-records"].year } }
									]
								}
							)
							.then((data) => {
								regLog.users[i]['error'] = 'Added data eval '+model["evaluations-records"].year
							})
							.catch(error => {
								console.error(error)
								regLog.users[i]['error'] = error
							})
						} else {
							modelEvaluation.updateOne({ _id: model._id }, { $push: { records: model["evaluations-records"] } })
							.then((data) => {
								regLog.users[i]['error'] = 'Added data eval '+model["evaluations-records"].year
							})
							.catch(error => {
								console.error(error)
								regLog.users[i]['error'] = error
							})
						}
					})
					.catch(error => {
						console.error(error)
						regLog.users[i]['error'] = error
					})
				} else {
					let save = {
						_id: model._id,
						records: [model["evaluations-records"]]
					}

					return await new modelEvaluation(save).save()
					.then((data) => {
						regLog.users[i]['error'] = 'Inserted data eval '+model["evaluations-records"].year
					})
					.catch(error => {
						console.error(error)
						regLog.users[i]['error'] = error
					})
				}
			})
			.catch(error => {
				console.error(error)
				regLog.users[i]['error'] = error
			})
		}

		for(let iterator in req.body.data) {
			const i = parseInt(iterator)

			// regLog will be returned as a file log in excel for each operation
			regLog.users[i] = {
				_id: String(('fields' in req.body) ? req.body.data[i][req.body.fields._id] : req.body.data[i]._id).trim(),
			}
			regLog.users[i][Array('name', 'nombre')[lang]] = ('fields' in req.body)
				? req.body.data[i][req.body.fields.name]
				: req.body.data[i].name
			regLog.users[i][Array('system_user', 'usuario_de_sistema')[lang]] = Array('Omitido', 'Skipped')[lang]
			regLog.users[i][Array('pass', 'clave_de_acceso')[lang]] = Array('Omitido', 'Skipped')[lang]
			regLog.users[i][Array('information_user', 'informacion_de_usuario')[lang]] = Array('Omitido', 'Skipped')[lang]
			regLog.users[i]['error'] = ''

			// Sign in validator
			await modelUserInfo.findOne(
				{ _id: String(('fields' in req.body) ? req.body.data[i][req.body.fields._id] : req.body.data[i]._id).trim() },
				{ _id: 1 }
			)
			.then(async(dataUserInfo) => {
				model = { // Structure compatible with the all the models used
					/**
					 * If in the body there is a 'fields' it means that a file was uploaded,
					 * then the data of the columns of the excel will be with a custom name
					 * and we'll retrieving the data with the custom name instead of the
					 * expected
					**/
					_id: String(('fields' in req.body) ? req.body.data[i][req.body.fields._id] : req.body.data[i]._id).trim(),
					name: String(('fields' in req.body) ? req.body.data[i][req.body.fields.name] : req.body.data[i].name).trim(),
					area: String(('fields' in req.body) ? req.body.data[i][req.body.fields.area] : req.body.data[i].area).trim(),
					directorate: String(('fields' in req.body) ? req.body.data[i][req.body.fields.directorate] : req.body.data[i].directorate).trim(),
					position: String(('fields' in req.body) ? req.body.data[i][req.body.fields.position] : req.body.data[i].position).trim(),
					category: String(('fields' in req.body) ? req.body.data[i][req.body.fields.category] : req.body.data[i].category).trim(),
					manager: String(('fields' in req.body)
						? (req.body.fields.manager in req.body.data[i])
							? String(req.body.data[i][req.body.fields.manager]).trim()
							: 'null'
						: ('manager' in req.body.data[i])
							? req.body.data[i].manager
							: 'null').trim(),
					// blame system™ 😎
					log: req.body.log
				}
				let nextStep = true,
					errorGetter = null
					findUser = ('find_user' in req.body.data[i]),
					newUser = ('fields' in req.body)
						? (req.body.fields.new_user in req.body.data[i])
							? (String(req.body.data[i][req.body.fields.new_user]).trim().length > 0)
							: false
						: ('new_user' in req.body.data[i]),
					testEval = false

				/**
				 * Fuzzy search all the posible data that can be duplicated
				 * Create a document if, for example, the area isn't in the
				 * db and get its ID, but it matches with an already in db
				 * area, then just get its ID
				**/
				if(model.area != 'undefined')
					model['area'] = await getFuzzy(model['area'], 'area').then(fuzzID => {
						if(parseInt(fuzzID) > 0) return parseInt(fuzzID)
						else nextStep = false
					}).catch(error => {console.error(error); nextStep = false; errorGetter = error})
				if(model.directorate != 'undefined')
					model['directorate'] = await getFuzzy(model['directorate'], 'directorate').then(fuzzID => {
						if(parseInt(fuzzID) > 0) return parseInt(fuzzID)
						else nextStep = false
					}).catch(error => {console.error(error); nextStep = false; errorGetter = error})
				if(model.position != 'undefined')
					model['position'] = await getFuzzy(model['position'], 'position').then(fuzzID => {
						if(parseInt(fuzzID) > 0) return parseInt(fuzzID)
						else nextStep = false
					}).catch(error => {console.error(error); nextStep = false; errorGetter = error})
				if(model.category != 'undefined')
					model['category'] = await getFuzzy(model['category'], 'category').then(fuzzID => {
						if(parseInt(fuzzID) > 0) return parseInt(fuzzID)
						else nextStep = false
					}).catch(error => {console.error(error); nextStep = false; errorGetter = error})

				if('sp-year' in req.body.fields) { // For testing 
					if(parseInt(req.body.data[i][req.body.fields["sp-year"]]) > 2015) {
						testEval = true
						model["evaluations-records"] = {
							year: parseInt(req.body.data[i][req.body.fields["sp-year"]]),
							score: parseFloat(req.body.data[i][req.body.fields["sp-score"]]),
							answers: req.body.data[i][req.body.fields["sp-answers"]].split(','),
							area: model.area,
							directorate: model.directorate,
							manager: model.manager
						}
					}
				}

				if(nextStep) {
					if(dataUserInfo) { // If the user exists
						if(findUser) { // If there is 'find_user'
							return createSysUser(model._id, i, model.name) // Create system user
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
							} else if(isFile && i >= (regLog.length-1)) {
								res.append('msg', Array(
									'Se completo el registro con algunos datos duplicados. Por favor, Revise en el archivo descargado.',
									'The registration is complete with some duplicated data. Check in the downloaded file.'
								)[lang])
								return res.status(409).send(await saveAsExcel(regLog.users))
							}
						}
					} else { // Save a new information_user
						await new modelUserInfo(model).save()
						.then(async(save) => { //🟢
							regLog.users[i][Array('information_user', 'informacion_de_usuario')[lang]] = Array(
								'Información guardada',
								'Information saved'
							)[lang]

							// If test
							if(testEval)
								await addEvalRecords(model, i)

							// And if the employee is a system user
							if(newUser)
								return await createSysUser(model._id, i, model.name)
							
							if(!isFile) {
								res.append('msg', Array(
									`¡Información registrada correctamente!`,
									`Information successfully recorded!`
								)[lang])
								return res.status(200).send(await saveAsExcel(regLog.users))
							} else if(isFile && i >= (regLog.length-1)) {
								res.append('msg', Array(
									`!Proceso de registro completado correctamente!`,
									`Registration process successfully completed!`
								)[lang])
								return res.status(200).send(await saveAsExcel(regLog.users))
							}
						})
						.catch(async(error) => { //🔴
							console.error(error)
							regLog.users[i][Array('information_user', 'informacion_de_usuario')[lang]] = Array(
									'Revisa la información enviada y notifica al administrador. Ocurrió un error al leer los datos.',
									'Unable to register user. Please try again later.'
								)[lang]
							regLog.users[i]['error'] = error

							if((isFile && i >= (regLog.length-1)) || !isFile) {
								res.append('msg', Array(
									'Proceso con errores. Revisa en el archivo descargado.',
									'Process with errors. Check in the downloaded file.'
								)[lang])
								return res.status(500).send(await saveAsExcel(regLog.users))
							}
						})
					}
				} else {
					regLog.users[i][Array('information_user', 'informacion_de_usuario')[lang]] = Array(
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
					} else if(isFile && i >= (regLog.length-1)) {
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

				if((isFile && i >= (regLog.length-1)) || !isFile) {
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

async function fuzzySearch(req, res) {
	await fuzzy({ query: req.body.query, collection: req.body.collection })
	.then(async(data) => {
		return res.json({
			data: data,
			status: 200
		})
	})
	.catch(error => {
		console.error(error)
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

async function superUser(req, res) {
	if(!('_id' in req.session)) {
		res.json({
			msg: Array('Por favor, inicia sesión nuevamente', 'Please, log in again'),
			snack: 'true',
			status: 401
		})
		return res.status(401).end()
	}

	return await modelUser.findOne({ _id: req.session._id }, { _id: 1, pass: 1, enabled: 1 })
	.then(async(dataUser) => {
		if('_id' in dataUser) {
			let compare = crypto.AES.decrypt(dataUser.pass, dataUser._id)
			if(compare.toString(crypto.enc.Utf8) === req.body.pass) {
				return await modelUserInfo.updateOne({_id: req.body._id}, {$set: { super: true }})
				.then((data) => {
					return res.status(200).json({
						msg: Array('Agregado super usuario exitosamente', 'Added super user successfully'),
						snack: 'true',
						status: 200
					})
				})
				.catch(error => {
					console.error(error)
					return res.status(500).json({
						msg: Array(
							'Error en el servidor. Revisa la consola y comunicate con el administrador.',
							'Server error. Check the console and contact the administrator.'),
						snack: 'true',
						status: 500
					})
				})
			}
		} 
		return res.json({
			msg: Array(
				'La contraseña no coincide. Intentalo de nuevo por favor.',
				'The password does not match. Please try again.'
			),
			snack: true,
			status: 404
		})
	})
	.catch((error) => { //if error 🤬
		console.error(error)
		return res.json({
			msg: Array(
				'Error del servidor. Contacta con el administrador.',
				'Server error. Contact the administrator.'
			),
			snack: true,
			error: true,
			status: 500
		})
	})
}

async function addRecordsToCollection(req, res) {
	if(!('_id' in req.session)) {
		res.json({
			msg: Array('Por favor, inicia sesión nuevamente', 'Please, log in again'),
			snack: 'true',
			snackType: 'error',
			status: 401
		})
		return res.status(401).end()
	}

	let passRecords = true
	req.body.description.forEach(node => {
		if(node.length < 1 && passRecords) {
			passRecords = false
			return res.json({
				msg: Array(
					`Un campo se encuentra vació. Por favor, llénalo antes de enviar los datos.`,
					`One field is empty. Please fill it before sending the data.`
				)[req.session.lang],
				snack: 'true',
				snackType: 'warning',
				status: 404
			})
		}
	})
	if(!passRecords) return res.status(404).end()

	const FORMAT_DATE = `${ DATE.getFullYear() }-`+
	`${ (String(DATE.getMonth()+1).length == 1) ? '0'+(DATE.getMonth()+1) : DATE.getMonth()+1 }-`+
	`${ (String(DATE.getDate()).length == 1) ? '0'+(DATE.getDate()) : DATE.getDate() }`
	// hh:mm
	const FORMAT_HOUR = `${ (String(DATE.getHours()).length == 1) ? '0'+(DATE.getHours()) : DATE.getHours() }:`+
	`${ (String(DATE.getMinutes()).length == 1) ? '0'+(DATE.getMinutes()) : DATE.getMinutes() }`
	let modelMaster

	switch (req.body.collection) {
		case 'area':
			modelMaster = modelArea
			break

		case 'directorate':
			modelMaster = modelDirectorate
			break

		case 'position':
			modelMaster = modelPosition
			break

		case 'category':
			modelMaster = modelCategory
			break
	
		default:
			return res.status(404).json({
				msg: Array(
					`No se encontró la colección objetivo. Se recibió ${req.body.collection}.`,
					`The target collection was not found. Received ${req.body.collection}.`
				)[req.session.lang],
				snack: 'true',
				snackType: 'warning',
				status: 404
			})
	}

	return await modelMaster.aggregate([
		{ $sort: { '_id': -1 } },
		{ $limit: 1 },
		{ $project: { '_id': 1 } }
	])
	.then(async(data) => {
		let save = {
			_id: parseInt(data[0]._id) + 1,
			description: req.body.description,
			log: {
				_id: req.session._id,
				name: req.session.name,
				timestamp: {
					date: FORMAT_DATE,
					time: FORMAT_HOUR
				},
				operation: 'created'
			}
		}

		return await new modelMaster(save).save()
		.then((dataSave) => {
			return res.status(200).json({
				msg: Array('Se agrego el registro exitosamente', 'Added record successfully'),
				data: dataSave,
				snack: 'true',
				snackType: 'success',
				status: 200
			})
		})
		.catch(error => {
			console.error(error)
			return res.status(500).json({
				msg: Array(
					'Imposible guardar en la base de datos. Revisa la consola y comunicate con el administrador.',
					'Server error. Check the console and contact the administrator.'),
				snack: 'true',
				snackType: 'error',
				error: error,
				status: 500
			})
		})
	})
	.catch(error => {
		console.error(error)
		return res.status(500).json({
			msg: Array(
				'Error en el servidor. Revisa la consola y comunicate con el administrador.',
				'Server error. Check the console and contact the administrator.'),
			snack: 'true',
			snackType: 'error',
			error: error,
			status: 500
		})
	})
}

module.exports = {
	signUp,
	fuzzySearch,
	superUser,
	addRecordTo: addRecordsToCollection,
}