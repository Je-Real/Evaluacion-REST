const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const modelArea = require('../models/modelArea')
const modelDirection = require('../models/modelDirection')

const sharp = require('sharp')
const pdf = require('pdfjs')

const DATE = new Date()
const CURRENT_YEAR = DATE.getFullYear()

// >>>>>>>>>>>>>>>>>>>>>> Reportes <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let areas = [],
		directions = [],
		subordinates = []

	if(!('_id' in req.session)) { // No session 😡
		res.redirect('/home/')
	} else { // Session 🤑
		if(req.session.super) {
			areas = await modelArea.find({}) // Get all areas in DB
				.catch((error) => { console.error(error) })
			directions = await modelDirection.find({}) // Get all directions in DB
				.catch((error) => { console.error(error) })
		}
		else {
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

			directions = await modelUserInfo.aggregate([
				{
					$match: {
						$or: [ { _id: req.session._id }, { manager: req.session._id } ],
					}
				}, {
					$lookup: {
						from: "directions",
						pipeline: [ { $unset: ["__v"] } ],
						localField: "direction",
						foreignField: "_id",
						as: "direction",
					},
				}, {
					$unwind: {
						path: "$direction",
						preserveNullAndEmptyArrays: true,
					},
				}, {
					$group: {
						_id: "$direction._id",
						description: { $addToSet: "$direction.description" },
						count: { $sum: 1 },
					},
				}, {
					$unwind: {
						path: "$description",
						preserveNullAndEmptyArrays: true,
					},
				},
			]) // Get all directions in DB
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
			directions: directions,
			areas: areas,
			subordinates: subordinates,
		})
	}
}

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
	else if('direction' in req.body) {
		search['records.direction'] = req.body.direction
		filter['records.direction'] = req.body.direction
	}
	else {
		search['records.manager'] = req.session._id
		filter['records.manager'] = req.session._id
	}
	
	modelEvaluation.aggregate([
		{
			$match: search
		}, {
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
							direction: 1
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

			// If an area or direction is requested, then get the employees of the search
			if(req.body._id == null || req.body._id == undefined) {
				search = {}

				if('_id' in req.body) {
					search._id = (req.body._id).trim()
				}
				else if('area' in req.body)
					search.area = req.body.area
				else if('direction' in req.body)
					search.direction = req.body.direction
				
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
							'direction', 'category', '__v', 'log'
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
			msg: 'Algo salio mal.\n\r¡No te alarmes! Todo saldra bien.',
			status: 404,
			snack: true,
			notiType: 'error',
			error: error
		})
	})
}

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
				"ES Languaje",	(String)
				"EN Languaje"	(String)
			]

		},
		{...}]
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
	else if (req.body.search == 'directions')
		modelMaster = modelDirection
	else
		return failure()

	if('FORCE_YEAR_TO' in req.body)
		return await modelMaster.aggregate(uAggregate)
	else
		modelMaster.aggregate(uAggregate)
		.then(data => { success(data) })
		.catch(error => { console.error(error); failure() })
}

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

	const lang = req.session.lang
	const DATA = await req.body
	const FORMAT_DATE = `${ DATE.getFullYear() }-`+
		`${ (String(DATE.getMonth()+1).length == 1) ? '0'+(DATE.getMonth()+1) : DATE.getMonth()+1 }-`+
		`${ (String(DATE.getDate()).length == 1) ? '0'+(DATE.getDate()) : DATE.getDate() }`
	const doc = new pdf.Document({ // Vertical letter
		width:   612, // 21.59 cm
		height:  792, // 27.94 cm
		padding: 32
	})

	res.append('filename', Array(
		`reporte-${FORMAT_DATE}.pdf`,
		`report-${FORMAT_DATE}.pdf`
	)[req.session.lang])
	res.append('snack', 'true')
	try {
		const header = doc.header().table({widths: [150, 240, 150], borderWidth: 0})
		const hTable = header.row()

		hTable.cell({ paddingLeft: 0.75*pdf.cm, paddingRight: 0.75*pdf.cm, paddingTop: 0.5*pdf.cm, paddingBottom: 0.5*pdf.cm })
			.text(req.session.name)
		hTable.cell().text('')
		hTable.cell({ paddingLeft: 0.75*pdf.cm, paddingRight: 0.75*pdf.cm, paddingTop: 0.5*pdf.cm, paddingBottom: 0.5*pdf.cm })
			.text(`${DATE.getDate()}/${DATE.getMonth()+1}/${CURRENT_YEAR}`, {textAlign: 'right'})

		if('poly' in req.body) {
			const theRecords = {
				past: await getAll({body:{search:DATA.barSearch, FORCE_YEAR_TO:parseInt(CURRENT_YEAR)-1}}, undefined),
				curr: await getAll({body:{search:DATA.barSearch, FORCE_YEAR_TO:CURRENT_YEAR}}, undefined)
			}

			const polyJPEG = await sharp(new Buffer.from(DATA.poly, 'base64')).resize({height: 400})
			.flatten({ background: '#ffffff' }).jpeg().toBuffer()

			// --------------------------- Comparison graph page --------------------------- //
			const img = new pdf.Image(polyJPEG)
			doc.cell({ paddingTop: 0.4*pdf.cm, paddingBottom: 0.5*pdf.cm }).text({ textAlign: 'center', fontSize: 14 })
				.add(`Comparación de areas (${parseInt(CURRENT_YEAR)-1} - ${parseInt(CURRENT_YEAR)})`)
			doc.cell({ paddingTop: 0.5*pdf.cm, paddingBottom: 0.5*pdf.cm }).image(img, { height: 7.5*pdf.cm, align: 'center'})

			const tableC = doc.table({
				widths: [340, 100, 100],
				borderVerticalWidths: [0, 1, 1, 0],
				borderHorizontalWidth: 1,
				borderColor: 0xadadad
			})
			const tHeader = tableC.header()
			tHeader.cell({ paddingLeft: 0.75*pdf.cm, paddingRight: 0.75*pdf.cm, paddingTop: 10})
				.text({ textAlign: 'center', fontSize: 10 }).add(DATA.barSearch)
			tHeader.cell({ paddingLeft: 0.75*pdf.cm, paddingRight: 0.75*pdf.cm, paddingTop: 5, paddingBottom: 5})
				.text({ textAlign: 'center', fontSize: 10 }).add(`Porcentaje (${parseInt(CURRENT_YEAR)-1})`)
			tHeader.cell({ paddingLeft: 0.75*pdf.cm, paddingRight: 0.75*pdf.cm, paddingTop: 5, paddingBottom: 5})
				.text({ textAlign: 'center', fontSize: 10 }).add(`Porcentaje (${CURRENT_YEAR})`)


			for(let i in theRecords.curr) {{
				const row = tableC.row()
				row.cell({ paddingTop: 2, paddingBottom: 2, paddingLeft: 0.35*pdf.cm }).text({ textAlign: 'left', fontSize: 9 })
					.add(theRecords.curr[i].description[lang])
				row.cell({ paddingTop: 2, paddingBottom: 2, })
					.text({ textAlign: 'center', fontSize: 9, color: (theRecords.past[i].length != 0) ? 0x000000 : 0x505050 })
					.add((theRecords.past[i].length != 0) ? theRecords.past[i].total / theRecords.past[i].length : 'N.A.')
				row.cell({ paddingTop: 2, paddingBottom: 2, })
					.text({ textAlign: 'center', fontSize: 9, color: (theRecords.curr[i].length != 0) ? 0x000000 : 0x505050 })
					.add((theRecords.curr[i].length != 0) ? theRecords.curr[i].total / theRecords.curr[i].length : 'N.A.')
			}}

			doc.pageBreak()
		}

		if('mono' in req.body) {
			// --------------------------- Individual Metrics page --------------------------- //
			const tableM = doc.table({
				widths: [null, null],
				borderWidth: 0,
			})

			for(let i in DATA.mono) {
				const r = tableM.row()
				for(let j in DATA.mono[i]) {
					const cell = r.cell({paddingTop: 3, paddingBottom: 0.75*pdf.cm})

					const semiJPEG = await sharp(new Buffer.from(DATA.mono[i][j].semi, 'base64')).resize({height: 200})
						.flatten({ background: '#ffffff' }).jpeg().toBuffer()
					const semiChart = new pdf.Image(semiJPEG)
					const lineJPEG = await sharp(new Buffer.from(DATA.mono[i][j].line, 'base64')).resize({height: 200})
						.flatten({ background: '#ffffff' }).jpeg().toBuffer()
					const lineChart = new pdf.Image(lineJPEG)

					cell.text({fontSize: 10, textAlign: 'center'}).add(DATA.mono[i][j].title).add()
					cell.image(semiChart, { height: 3.1*pdf.cm, align: 'center' })
					cell.text({fontSize: 10, textAlign: 'center'}).add('Promedio total: '+DATA.mono[i][j].score)
					cell.image(lineChart, { height: 3.3*pdf.cm, align: 'center' })
				}
			}
		}
	} catch (error) {
		console.error(error)
		doc.end() // Close file
		res.status(500).end()
	} finally {
		res.append('filename', 'output.pdf')
		return await res.send(await doc.asBuffer())
	}
}

module.exports = {
	root,
	getOne,
	getAll,
	printer
}