const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const modelArea = require('../models/modelArea')
const modelDirectorate = require('../models/modelDirectorate')

const XLSXPopulate = require('xlsx-populate')

const { fuzzySearch } = require('./util/fuzzy')

const DATE = new Date()
const CURRENT_YEAR = DATE.getFullYear()

// >>>>>>>>>>>>>>>>>>>>>> Reportes <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let areas = [],
		directorates = [],
		subordinates = [],
		areaManager = {}

	if(!('_id' in req.session)) { // No session 😡
		res.redirect('/home/')
	} else { // Session 🤑
		if(req.session.super) {
			let positions = {
				rectory: 'Rector',
				ld: 'Director de Vinculación',
				juridical: 'Jefe de departamento de Asuntos Jurídicos',
				lil: 'Jefe de Departamento de Logística y Enlace Institucional',
				accounting: 'Jefe de Oficina en Contabilidad de Caja',
				afd: 'Directora de Administración y Finanzas',
				pbd: 'Jefe del departamento de Programación y Presupuesto',
				procurement: 'Jefa de departamento de Adquisiciones',
				administrative: 'Subdirector de Servicios Administrativos',
				hcd: 'Jefe de departamento de Capital Humano',
				id: 'Jefe de departamento de Infraestructura',
				ntd: 'Jefe de departamento de Redes y Telecomunicaciones ',
				dipe: 'Coordinadora de Planeación',
				sp: 'Subdirector de Planeación',
				info: 'Coordinador del Centro de Información',
				quality: '',
				ies: 'Subdirectora de Evaluación',
				dpcue: 'Director de Promoción, Comunicación y Extensión Universitaria',
				csd: 'Subdirector de Atención al Cliente',
				language: 'Jefe de departamento de Idiomas',
				ifd: 'Jefe de departamento de Formación Integral'
				
				//: 'Médico',
				//: 'Directora Académica de Administración y Contaduría',
				//: 'Secretario Académico',
				//: 'Jefe de departamento de Contabilidad',
				//: 'Titular de la Unidad Auditora del Órgano Interno de Control',
				//: 'Directora Académica del Área Industrial',
				//: 'Director Académico de Tecnologías de la Información',
				//: 'Coordinación de Servicios Escolares',
				//: 'Director Académico de Agricultura y DNM',
			}

			for(let area in positions) {
				let res = await fuzzySearch({query: positions[area], collection: 'areaPosition'})
				
				areaManager[area] = ''
				if(res)
					if(res.length) 
						areaManager[area] = `${res[0]._id} - ${res[0].name}`
			}

			areas = await modelArea.find({}) // Get all areas in DB
				.catch((error) => { console.error(error); return [] })
			directorates = await modelDirectorate.find({}) // Get all directorates in DB
				.catch((error) => { console.error(error); return [] })
		} else {
			areas = await modelUserInfo.aggregate([
				{
					$match: {
						$or: [ { _id: req.session._id }, { manager: req.session._id } ],
					}
				}, {
					$lookup: {
						from: "areas",
						pipeline: [ { $unset: ["__v"] } ],
						localField: "area",
						foreignField: "_id",
						as: "area",
					},
				}, {
					$unwind: {
						path: "$area",
						preserveNullAndEmptyArrays: true,
					},
				}, {
					$group: {
						_id: "$area._id",
						description: { $addToSet: "$area.description" },
						count: { $sum: 1 },
					},
				}, {
					$unwind: {
						path: "$description",
						preserveNullAndEmptyArrays: true,
					},
				},
			]) // Get the areas of the user and subordinates
			.catch((error) => { console.error(error) })

			directorates = await modelUserInfo.aggregate([
				{
					$match: {
						$or: [ { _id: req.session._id }, { manager: req.session._id } ],
					}
				}, {
					$lookup: {
						from: "directorates",
						pipeline: [ { $unset: ["__v"] } ],
						localField: "directorate",
						foreignField: "_id",
						as: "directorate",
					},
				}, {
					$unwind: {
						path: "$directorate",
						preserveNullAndEmptyArrays: true,
					},
				}, {
					$group: {
						_id: "$directorate._id",
						description: { $addToSet: "$directorate.description" },
						count: { $sum: 1 },
					},
				}, {
					$unwind: {
						path: "$description",
						preserveNullAndEmptyArrays: true,
					},
				},
			]) // Get all directorates in DB
			.catch((error) => { console.error(error) })
		}

		subordinates = await modelUserInfo.aggregate([ // Get all subordinates of the user
			{ $match: { manager: req.session._id } },
			{
				$lookup: {
					from: 'positions',
					pipeline: [ { $unset: ['_id', '__v'] } ],
					localField: 'position',
					foreignField: '_id',
					as: 'position',
				},
			}, {
				$project: {
					_id: true,
					position: true,
				},
			}, {
				$unwind: {
					path: '$position',
					preserveNullAndEmptyArrays: true,
				},
			},
		])
		.catch((error) => {
			console.error(error)
		})

		// Metrics route
		return res.status(200).render('metrics', {
			title_page: 'UTNA - Metricas',
			session: req.session,
			directorates: directorates,
			areas: areas,
			subordinates: subordinates,
			areaManager: areaManager
		})
	}
}

/**
 * Individual reports (Metrics on cards)
 * @param {*} req
 * @param {*} res
 * @returns
 */
function getOne(req, res) {
	if(!('_id' in req.session)) {
		return res.json({
			msg: [
				`Por favor, inicia sesión nuevamente`,
				`Please, log in again`
			],
			status: 401,
			snack: true
		})
	}

	let search = {}, filter = {
			'records.year': {
				$gte: CURRENT_YEAR-4,
				$lte: CURRENT_YEAR
			},
			'records.disabled': {
				$exists: false
			}
		}

	if('_id' in req.body) {
		search._id = (req.body._id).trim()
		filter._id = (req.body._id).trim()

		if(req.session.category > 1){
			search['records.manager'] = req.session._id
			filter['records.manager'] = req.session._id
		}
	}
	else if('area' in req.body) {
		search['records.area'] = req.body.area
		filter['records.area'] = req.body.area
	}
	else if('directorate' in req.body) {
		search['records.directorate'] = req.body.directorate
		filter['records.directorate'] = req.body.directorate
	}
	else {
		search['records.manager'] = req.session._id
		filter['records.manager'] = req.session._id
	}

	modelEvaluation.aggregate([
		{ $match: search },
		{
			$unwind: {
				path: '$records',
				preserveNullAndEmptyArrays: true
			}
		}, { $match: filter }, {
			$group: {
				_id: '$_id',
				records: {
					$addToSet: '$records'
				}
			}
		}
	])
	.then(async(dataEval) => { //🟢
		/*	Data Example:

			[ {...},
				{
					_id: "0000"
					records: [
						{...},
						{
							year: 2000
							score: 99.9
							answers: [...]
							area: 1
							directorate: 1
							manager: "manager_id"
						},
						{...}
				},
			{...} ]
		*/
		if(dataEval) {
			let showingYears = [], // From 4 years ago to the current year
				yearsAverages = [0, 0, 0, 0, 0], // 5 positions for 5 years
				i = [0, 0, 0, 0, 0], // Iterator for each employee gotten on the years
				finalAverage = 0, // Average of averages
				subordinates = []

			for(let year = 4; year >= 0; year--) { // Set the 5 years
				showingYears.push(CURRENT_YEAR - year)
			}

			for(let data in dataEval) { // Get a sum of all records of each employee
				for(let record in dataEval[data].records) {
					let yearPos = 4 - (CURRENT_YEAR - dataEval[data].records[record].year)
					yearsAverages[yearPos] += parseFloat((dataEval[data].records[record].score).toFixed(2))
					i[yearPos]++
				}
			}

			for(let j in yearsAverages) { // Get averages per year
				if(i[j] > 0) {
					yearsAverages[j] = parseFloat((yearsAverages[j] / i[j]).toFixed(2))
					finalAverage += yearsAverages[j] // Sum of all averages
				}
			}

			// Get all the elements counted and get the average of averages
			let divideBy = i.reduce(
				(sum, currentVal) => (currentVal > 0) ? sum+1 : sum, 0
			)
			finalAverage = parseFloat((finalAverage / divideBy).toFixed(2))

			// If an area or directorate is requested, then get the employees of the search
			if((req.body._id == null || req.body._id == undefined) && req.session.super) {
				search = {}

				if('_id' in req.body) {
					search._id = (req.body._id).trim()
				}
				else if('area' in req.body)
					search.area = req.body.area
				else if('directorate' in req.body)
					search.directorate = req.body.directorate

				search.manager = req.session._id

				await modelUserInfo.aggregate([
					{ '$match': search }, {
						'$lookup': {
							'from': 'positions',
							'pipeline': [
								{ '$unset': ['_id', '__v'] }
							],
							'localField': 'position',
							'foreignField': '_id',
							'as': 'position'
						}
					}, {
						'$unset': [
							'enabled', 'name', 'manager', 'area',
							'directorate', 'category', '__v', 'log'
						]
					}, {
						'$unwind': { 'path': '$position' }
					}, {
						'$set': { 'position': '$position.description' }
					}
				])
				.then((dataSubs) => {
					subordinates = dataSubs // Get all the subordinates
				})
				.catch((error) => {
					console.error(error)
				})
			}
			else subordinates = null

			return res.json({
				data: {
					total: (finalAverage == NaN) ? null : finalAverage,
					log: {
						years: showingYears,
						records: yearsAverages
					},
					subordinates: subordinates
				},
				status: 200,
			})
		} else return res.json({
			data: null,
			status: 404,
		})
	})
	.catch((error) => { //🔴
		console.error(error)
		return res.status(404).json({
			msg: 'Algo salio mal. Contacta con el administrador',
			status: 404,
			snack: true,
			notiType: 'error',
			error: error
		})
	})
}

/**
 * For bar chart (Not used since there are a
 * lot of areas, directorates, etc)
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function getAll(req, res) {
	if(!('_id' in req.session)) {
		return res.json({
			msg: [
				`Por favor, inicia sesión nuevamente`,
				`Please, log in again`
			],
			status: 401,
			snack: true
		})
	}

	let search = {}, uAggregate,
		yearSel = ('FORCE_YEAR_TO' in req.body) ? req.body.FORCE_YEAR_TO : CURRENT_YEAR

	search['records.'+yearSel] = { $exists: true }
	search['records.'+yearSel+'.disabled'] = { $exists: false }
	uAggregate = [
		{
			$lookup: {
				from: 'evaluations',
				pipeline: [
					{ $match: search },
					{
						$group: {
							_id: `$records.${yearSel}.${req.body.search}`,
							total: { $sum: `$records.${yearSel}.score` },
							length: { $sum: 1 },
						},
					}, {
						$lookup: {
							from: `${req.body.search}s`,
							pipeline: [ { $unset: ['n', '_id', 'desc'] } ],
							localField: '_id',
							foreignField: '_id',
							as: `${req.body.search}_`,
						},
					}, {
						$replaceRoot: {
							newRoot: {
								$mergeObjects: [
									{ $arrayElemAt: ['$area_', 0] }, '$$ROOT',
								],
							},
						},
					}, { $unset: [`${req.body.search}_`] },
				],
				localField: '_id',
				foreignField: 'records.2022.area',
				as: '_avg',
			},
		}, {
			$replaceRoot: {
				newRoot: {
					$mergeObjects: [ { $arrayElemAt: ['$_avg', 0] }, '$$ROOT' ],
				},
			},
		}, {
			$set: {
				total: {
					$cond: [
						{ $ifNull: ['$total', false] },
						'$total', 0,
					],
				},
				length: {
					$cond: [
						{ $ifNull: ['$length', false] },
						'$length', 0,
					],
				},
				_id: '$n',
			},
		},
		{ $unset: ['_avg', '__v'] },
	]

	/* 	We need the data like this:
		[{
			total: 90.5 		(Number)
			length: 5			(Number)
			description:[		(Array)
				"ES Language",	(String)
				"EN Language"	(String)
			]

		}, {...}]
	*/

	const failure = () => {
		if(!('FORCE_YEAR_TO' in req.body))
		return res.status(404).json({
			msg: 'La búsqueda no coincide dentro de los parámetros.',
			status: 404,
			snack: true,
			notiType: 'error'
		})
	}

	const success = (data) => {
		if(!('FORCE_YEAR_TO' in req.body))
		return res.status(200).json({
			data: data,
			status: 200
		})
	}

	let modelMaster

	if(req.body.search == 'area')
		modelMaster = modelArea
	else if (req.body.search == 'directorates')
		modelMaster = modelDirectorate
	else
		return failure()

	if('FORCE_YEAR_TO' in req.body)
		return await modelMaster.aggregate(uAggregate)
	else
		modelMaster.aggregate(uAggregate)
		.then(data => { success(data) })
		.catch(error => { console.error(error); failure() })
}

/**
 * Generate the output report (PDF)
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function printer(req, res) {
	if(!('_id' in req.session)) {
		return res.json({
			msg: [
				`Por favor, inicia sesión nuevamente`,
				`Please, log in again`
			],
			status: 401,
			snack: true
		})
	}

	const REQ = await req.body
	const FORMAT_DATE = `${ DATE.getFullYear() }-`+
		`${ (String(DATE.getMonth()+1).length == 1) ? '0'+(DATE.getMonth()+1) : DATE.getMonth()+1 }-`+
		`${ (String(DATE.getDate()).length == 1) ? '0'+(DATE.getDate()) : DATE.getDate() }`

		res.append('msg', Array( // MSG will change if it reaches some states
		`Documento generado correctamente. Descargando ahora.`,
		`Document generated successfully. Downloading now.`
	)[req.session.lang])

	const getEvaluations = async(match) => {
		try {
			return await modelEvaluation.aggregate([
				{
					$match: match
				}, {
					$unwind: { path: '$records' }
				}, {
					$match: { 'records.year': CURRENT_YEAR }
				}, {
					$replaceRoot: {
						newRoot: {
							'_id': '$_id',
							'year': '$records.year',
							'score': { $cond: [
									// If disable is not null (if exists)
									{ $eq: ['$records.disabled', true] },
									0, // user disabled
									'$records.score' // user with an evaluation already done
								]},
							'position': '$records.position'
						}
					}
				}, {
					$lookup: {
						from: 'positions',
						pipeline: [
							{ '$unset': [ '_id', '__v', 'log' ] },
							{ '$unwind': '$description' }
						],
						localField: 'position',
						foreignField: '_id',
						as: 'position'
					}
				}
			])
		} catch (error) {
			throw error
		}
	}

	const posSelector = Array('Puesto', 'Position')[req.session.lang]
	const dirSelector = Array('Dirección', 'Directorate')[req.session.lang]
	const avgSelector = Array('Promedio', 'Average')[req.session.lang]

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
				return (String(row[fieldName]).length != 0) ? row[fieldName] : ''
			})
		})
		sheetData.unshift(header)
		return sheetData
	}

	let directionsTable = [],
		transaction
	if('directorates' in REQ.data) {
		for(let dir in REQ.data.directorates) {
			if(!(REQ.data.directorates[dir]._id)) { // No id directorate
				console.error({
					Error: 'No directorate data in '+REQ.data.directorates[dir].description,
					Data: REQ.data.directorates[dir]
				})
				res.append('msg', Array(
					`No se recibieron algunos datos para búsqueda de métricas. Contacta con el administrador.`,
					`Some data were not received for metrics search. Contact the administrator.`
				)[req.session.lang])
				return res.status(500).end({})
			}

			let match = {
				'records.directorate': parseInt(REQ.data.directorates[dir]._id)
			}

			transaction = await getEvaluations(match)
			.then(employees => {
				/* Data expected
					[
						{
							_id: '0000',
							year: 2000,
							score: 99.99,
							position: ['Puesto', 'Position']
						}, {...}
					]
				*/

				if(employees.length) {
					let divideBy = 0
					let directionAvg = 0

					employees.forEach((employee) => { // Sum all scores
						if(employee.score > 0) {
							directionAvg += employee.score
							divideBy++
						}
					})

					directionAvg = (directionAvg == undefined) ? 0 : parseFloat((directionAvg / divideBy).toFixed(2))

					let push = {}
					push[dirSelector] = REQ.data.directorates[dir].description
					push[avgSelector] = directionAvg

					directionsTable.push(push)
					return true
				} else return false
			})
			.catch(error => {
				console.error(error)
				res.append('error', error)
				res.append('msg', Array(
					`Ocurrió un error en búsqueda de métricas. Contacta con el administrador.`,
					`An error occurred in metrics search. Contact the administrator.`
				)[req.session.lang])
				res.append('snack', 'true')
				res.status(500).end()
				return false
			})
		}
	}

	let areasTable = []
	if('areas' in REQ.data) {
		for(let area in REQ.data.areas) {
			if(!(REQ.data.areas[area]._id)) { // No id area
				console.error({
					Error: 'No area data in '+REQ.data.areas[area].description,
					Data: REQ.data.areas[area]
				})
				res.append('msg', Array(
					`No se recibieron algunos datos para búsqueda de métricas. Contacta con el administrador.`,
					`Some data were not received for metrics search. Contact the administrator.`
				)[req.session.lang])
			}
			let match = {}
			if(typeof REQ.data.areas[area]._id === 'string')
				match['records.manager'] = REQ.data.areas[area]._id
			else
				match['records.area'] = parseInt(REQ.data.areas[area]._id)

			transaction = await getEvaluations(match)
			.then(employees => {
				/* Data expected
					[
						{
							_id: '0000',
							year: 2000,
							score: 99.99,
							position: [
								{ description: 'Puesto' },
								{ description: 'Position' },
							]
						}, {...}
					]
				*/

				if(employees.length) {
					let push = {
						description: REQ.data.areas[area].description
					}, employeeRecords = []

					employees.forEach(employee => {
						let info ={}
						info[posSelector] = employee.position[req.session.lang].description
						info[avgSelector] = employee.score
						employeeRecords.push(info)
					})

					push['records'] = employeeRecords

					areasTable.push(push)
					return true
				} else return false
			})
			.catch(error => {
				console.error(error)
				res.append('error', error)
				res.append('msg', Array(
					`Ocurrió un error en búsqueda de métricas. Contacta con el administrador.`,
					`An error occurred in metrics search. Contact the administrator.`
				)[req.session.lang])
				res.append('snack', 'true')
				res.status(500).end()
				return false
			})
		}
	}

	let aDirectorateTable = []
	if('a_directorates' in REQ.data) {
		for(let adir in REQ.data.a_directorates) {
			if(!(REQ.data.directorates[adir]._id)) { // No id academic directorate
				console.error({
					Error: 'No academic directorate data in '+REQ.data.directorates[adir].description,
					Data: REQ.data.directorates[adir]
				})
				res.append('msg', Array(
					`No se recibieron algunos datos para búsqueda de métricas. Contacta con el administrador.`,
					`Some data were not received for metrics search. Contact the administrator.`
				)[req.session.lang])
			}
			let match = {
				'records.directorate': parseInt(REQ.data.directorates[adir]._id)
			}

			transaction = await getEvaluations(match)
			.then(employees => {
				/* Data expected
					[
						{
							_id: '0000',
							year: 2000,
							score: 99.99,
							position: [{description: 'Puesto'}, {description: 'Position'}]
						}, {...}
					]
				*/
				
				if(employees.length > 0) {
					let push = {
						description: REQ.data.a_directorates[adir].description
					}, employeeRecords = []
					
					employees.forEach(employee => {
						let info = {}
						info[posSelector] = employee.position[req.session.lang].description
						info[avgSelector] = employee.score
						employeeRecords.push(info)
					})

					push['records'] = employeeRecords

					aDirectorateTable.push(push)
					return true
				} else return false
			})
			.catch(error => {
				console.error(error)
				res.append('error', error)
				res.append('msg', Array(
					`Ocurrió un error en búsqueda de métricas. Contacta con el administrador.`,
					`An error occurred in metrics search. Contact the administrator.`
				)[req.session.lang])
				res.append('snack', 'true')
				res.status(500).end()
				return false
			})
		}
	}

	let managerTable = []
	if('manager' in REQ.data) {
		for(let m in REQ.data.manager) {
			if(!String(REQ.data.manager[m]._id).length) { // No manager
				console.error({
					Error: 'No manager data in '+REQ.data.manager[m].description,
					Data: REQ.data.manager[m]
				})
				res.append('msg', Array(
					`No se recibieron algunos datos para búsqueda de métricas. Contacta con el administrador.`,
					`Some data were not received for metrics search. Contact the administrator.`
				)[req.session.lang])
			} else if(REQ.data.manager[m]._id == 0) {
				REQ.data.manager[m]._id = req.session._id
			}
			let match = {
				'records.manager': REQ.data.manager[m]._id
			}

			transaction = await getEvaluations(match)
			.then(employees => {
				/* Data expected
					[
						{
							_id: '0000',
							year: 2000,
							score: 99.99,
							position: ['Puesto', 'Position']
						}, {...}
					]
				*/

				if(employees.length) {
					let push = {
						description: REQ.data.manager[m].description
					}, employeeRecords = []

					employees.forEach(employee => {
						let info ={}
						info[posSelector] = employee.position[req.session.lang].description
						info[avgSelector] = employee.score
						employeeRecords.push(info)
					})

					push['records'] = employeeRecords

					managerTable.push(push)
					return true
				} else return false
			})
			.catch(error => {
				console.error(error)
				res.append('error', error)
				res.append('msg', Array(
					`Ocurrió un error en búsqueda de métricas. Contacta con el administrador.`,
					`An error occurred in metrics search. Contact the administrator.`
				)[req.session.lang])
				res.append('snack', 'true')
				res.status(500).end()
				return false
			})
		}
	}

	let subordinatesTable = []
	if('subordinates' in REQ.data) {
		for(let sub in REQ.data.subordinates) {
			if(!(REQ.data.manager[m]._id)) { // No subordinates
				console.error({
					Error: 'No subordinate data in '+REQ.data.subordinates[sub].description,
					Data: REQ.data.subordinates[sub]
				})
				res.append('msg', Array(
					`No se recibieron algunos datos para búsqueda de métricas. Contacta con el administrador.`,
					`Some data were not received for metrics search. Contact the administrator.`
				)[req.session.lang])
			}
			let match = {
				'records.manager': REQ.data.subordinates[sub]._id
			}

			transaction = await getEvaluations(match)
			.then(employees => {
				/* Data expected
					[
						{
							_id: '0000',
							year: 2000,
							score: 99.99,
							position: ['Puesto', 'Position']
						}, {...}
					]
				*/

				if(employees.length) {
					let push = {
						description: REQ.data.subordinates[sub].description
					}, employeeRecords = []

					employees.forEach(employee => {
						let info = {}
						info[posSelector] = employee.position[req.session.lang].description
						info[avgSelector] = employee.score
						employeeRecords.push(info)
					})

					push['records'] = employeeRecords

					subordinatesTable.push(push)
					return true
				} else return false
			})
			.catch(error => {
				console.error(error)
				res.append('error', error)
				res.append('msg', Array(
					`Ocurrió un error en búsqueda de métricas. Contacta con el administrador.`,
					`An error occurred in metrics search. Contact the administrator.`
				)[req.session.lang])
				res.append('snack', 'true')
				res.status(500).end()
				return false
			})
		}
	}

	if(transaction === true) {
		if(REQ.mode == 'all')
			res.append('filename', Array(
				`reporte-completo-${FORMAT_DATE}.xlsx`,
				`report-complete-${FORMAT_DATE}.xlsx`
			)[req.session.lang])
		else
			res.append('filename', Array(
				`reporte-${FORMAT_DATE}.xlsx`,
				`report-${FORMAT_DATE}.xlsx`
			)[req.session.lang])
		res.append('snack', 'true')

		return await res.status(200).send(
			await XLSXPopulate.fromBlankAsync().then(async(workbook) => {
				// Directorates averages
				let headerDirection = [dirSelector, avgSelector]
				const sheet_1 = workbook.sheet(0)
				sheet_1.name("sheet-1")

				if(directionsTable.length) {
					let sheet = sheet_1

					const sheetDataDir = getSheetData(directionsTable, headerDirection)
					const totalColumnsDir = sheetDataDir[0].length

					sheet.column('A').width(60)
					sheet.column('B').width(10)
					sheet.cell('A1').value(sheetDataDir)
					const endColumnDir = String.fromCharCode(64 + totalColumnsDir)
					sheet.row(1).style('bold', true)
					sheet.range('A1:' + endColumnDir + '1').style('fill', 'BFBFBF')
					sheet.range('A1:' + endColumnDir + '1').style('border', true)
				}

				// Employees by areas averages
				let alpha = 1,
					beta = 0,
					gamma = 0,
					rowStart = 1,
					headerAreas = [posSelector, avgSelector]
				const sheet_2 = (directionsTable.length) ? workbook.addSheet('sheet-2', 1) : sheet_1

				if(areasTable.length) {
					areasTable.forEach(area => {
						if(area.records.length) {
							const sheetDataArea = getSheetData(area.records, headerAreas)
							const totalColumnsArea = sheetDataArea[0].length

							let startColumnArea = String.fromCharCode(64 + alpha)
							if(beta > 0) startColumnArea = String.fromCharCode(64 + beta) + startColumnArea
							if(gamma > 0) startColumnArea = String.fromCharCode(64 + gamma) + startColumnArea

							let endColumnArea = String.fromCharCode(64 + alpha + (totalColumnsArea-1))
							if(beta > 0) endColumnArea = String.fromCharCode(64 + beta) + endColumnArea
							if(gamma > 0) endColumnArea = String.fromCharCode(64 + gamma) + endColumnArea

							// Title
							const rangeMerge = sheet_2.range(`${startColumnArea}${rowStart}:${endColumnArea}${rowStart}`)
							rangeMerge.value(area.description)
							rangeMerge.style({horizontalAlignment: 'center', verticalAlignment: 'center', })
							rangeMerge.merged(true)

							// Table
							sheet_2.column(startColumnArea).width(50)
							sheet_2.column(endColumnArea).width(10)
							sheet_2.cell(startColumnArea+`${rowStart+1}`).value(sheetDataArea)
							sheet_2.row(1).style('bold', true)
							sheet_2.range(startColumnArea+`${rowStart+1}:`+endColumnArea+`${rowStart+1}`).style('fill', 'BFBFBF')
							sheet_2.range(startColumnArea+`${rowStart+1}:`+endColumnArea+`${rowStart+1}`).style('border', true)

							// If CharCode is greater than last letter then
							// reset the alphabet and change the starting column.
							if((alpha + totalColumnsArea) > 24) {
								beta++
								alpha = (beta % 2) + 1
								if((beta + 1) >= 26) {
									beta = 1
									gamma++
								}
							}
							else alpha += totalColumnsArea + 1
						}
					})
				}

				if(REQ.mode == 'all') {
					alpha = 1
					beta = 0
					gamma = 0
					rowStart = 1
					headerAreas = [posSelector, avgSelector]
					const sheet_3 = (areasTable.length) ? workbook.addSheet('sheet-3', 2) : sheet_2

					aDirectorateTable.forEach(aDir => {
						if(aDir.records.length) {
							const sheetDataArea = getSheetData(aDir.records, headerAreas)
							const totalColumnsArea = sheetDataArea[0].length

							let startColumnArea = String.fromCharCode(64 + alpha)
							if(beta > 0) startColumnArea = String.fromCharCode(64 + beta) + startColumnArea
							if(gamma > 0) startColumnArea = String.fromCharCode(64 + gamma) + startColumnArea

							let endColumnArea = String.fromCharCode(64 + alpha + (totalColumnsArea-1))
							if(beta > 0) endColumnArea = String.fromCharCode(64 + beta) + endColumnArea
							if(gamma > 0) endColumnArea = String.fromCharCode(64 + gamma) + endColumnArea

							// Title
							const rangeMerge = sheet_3.range(startColumnArea+`${rowStart}:`+endColumnArea+`${rowStart}`)
							rangeMerge.value(aDir.description)
							rangeMerge.style({horizontalAlignment: 'center', verticalAlignment: 'center', })
							rangeMerge.merged(true)

							// Table
							sheet_3.column(startColumnArea).width(50)
							sheet_3.column(endColumnArea).width(10)
							sheet_3.cell(startColumnArea+`${rowStart+1}`).value(sheetDataArea)
							sheet_3.row(1).style('bold', true)
							sheet_3.range(startColumnArea+`${rowStart+1}:`+endColumnArea+`${rowStart+1}`).style('fill', 'BFBFBF')
							sheet_3.range(startColumnArea+`${rowStart+1}:`+endColumnArea+`${rowStart+1}`).style('border', true)

							// If CharCode is greater than last letter then
							// reset the alphabet and change the starting column.
							if((alpha + totalColumnsArea) >= 26) {
								alpha = 1
								beta++
								if((beta + 1) >= 26) {
									beta = 1
									gamma++
								}
							}
							else alpha += totalColumnsArea + 1
						}
					})
				}

				if(REQ.mode == 'mono') {
					managerTable.forEach(manager => {
						if(manager.records.length) {
							const sheetDataArea = getSheetData(manager.records, headerAreas)
							const totalColumnsArea = sheetDataArea[0].length

							let startColumnArea = String.fromCharCode(64 + alpha)
							if(beta > 0) startColumnArea = String.fromCharCode(64 + beta) + startColumnArea
							if(gamma > 0) startColumnArea = String.fromCharCode(64 + gamma) + startColumnArea

							let endColumnArea = String.fromCharCode(64 + alpha + (totalColumnsArea-1))
							if(beta > 0) endColumnArea = String.fromCharCode(64 + beta) + endColumnArea
							if(gamma > 0) endColumnArea = String.fromCharCode(64 + gamma) + endColumnArea

							// Title
							const rangeMerge = sheet_2.range(startColumnArea+`${rowStart}:`+endColumnArea+`${rowStart}`)
							rangeMerge.value(manager.description)
							rangeMerge.style({horizontalAlignment: 'center', verticalAlignment: 'center', })
							rangeMerge.merged(true)

							// Table
							sheet_2.column(startColumnArea).width(50)
							sheet_2.column(endColumnArea).width(10)
							sheet_2.cell(startColumnArea+`${rowStart+1}`).value(sheetDataArea)
							sheet_2.row(1).style('bold', true)
							sheet_2.range(startColumnArea+`${rowStart+1}:`+endColumnArea+`${rowStart+1}`).style('fill', 'BFBFBF')
							sheet_2.range(startColumnArea+`${rowStart+1}:`+endColumnArea+`${rowStart+1}`).style('border', true)

							// If CharCode is greater than last letter then
							// reset the alphabet and change the starting column.
							if((alpha + totalColumnsArea) >= 26) {
								alpha = 1
								beta++
								if((beta + 1) >= 26) {
									beta = 1
									gamma++
								}
							}
							else alpha += totalColumnsArea + 1
						}
					})

					subordinatesTable.forEach(sub => {
						if(sub.records.length) {
							const sheetDataArea = getSheetData(sub.records, headerAreas)
							const totalColumnsArea = sheetDataArea[0].length

							let startColumnArea = String.fromCharCode(64 + alpha)
							if(beta > 0) startColumnArea = String.fromCharCode(64 + beta) + startColumnArea
							if(gamma > 0) startColumnArea = String.fromCharCode(64 + gamma) + startColumnArea

							let endColumnArea = String.fromCharCode(64 + alpha + (totalColumnsArea-1))
							if(beta > 0) endColumnArea = String.fromCharCode(64 + beta) + endColumnArea
							if(gamma > 0) endColumnArea = String.fromCharCode(64 + gamma) + endColumnArea

							// Title
							const rangeMerge = sheet_2.range(startColumnArea+`${rowStart}:`+endColumnArea+`${rowStart}`)
							rangeMerge.value(sub.description)
							rangeMerge.style({horizontalAlignment: 'center', verticalAlignment: 'center', })
							rangeMerge.merged(true)

							// Table
							sheet_2.column(startColumnArea).width(50)
							sheet_2.column(endColumnArea).width(10)
							sheet_2.cell(startColumnArea+`${rowStart+1}`).value(sheetDataArea)
							sheet_2.row(1).style('bold', true)
							sheet_2.range(startColumnArea+`${rowStart+1}:`+endColumnArea+`${rowStart+1}`).style('fill', 'BFBFBF')
							sheet_2.range(startColumnArea+`${rowStart+1}:`+endColumnArea+`${rowStart+1}`).style('border', true)

							// If CharCode is greater than last letter then
							// reset the alphabet and change the starting column.
							if((alpha + totalColumnsArea) >= 26) {
								alpha = 1
								beta++
								if((beta + 1) >= 26) {
									beta = 1
									gamma++
								}
							}
							else alpha += totalColumnsArea + 1
						}
					})
				}

				return await workbook.outputAsync()
				.catch(error => {
					console.error(error)
					res.append('msg', Array(
						`Hubo un error en el documento generado.`,
						`There was an error in the generated document.`
					)[req.session.lang])
				})
			})
		)
	}
}

module.exports = {
	root,
	getOne,
	getAll,
	printer
}