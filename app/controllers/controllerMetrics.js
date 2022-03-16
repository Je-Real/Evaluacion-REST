const modelEvaluation = require('../models/modelEvaluation')
const modelUserInfo = require('../models/modelUserInfo')
const modelArea = require('../models/modelArea')
const modelDirection = require('../models/modelDirection')

const sharp = require('sharp')
const pdf = require('pdfjs')

const DATE = new Date()
const currYear = String(DATE.getFullYear())

// >>>>>>>>>>>>>>>>>>>>>> Reportes <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let areas = [],
		directions = [],
		subordinates = []

	if(!('_id' in req.session)) { // No session 😡
		res.redirect('/home/')
	} else { // Session 🤑
		areas = await modelArea.find({}) // Get all areas in DB
			.catch((error) => { console.log(error) })
		directions = await modelDirection.find({}) // Get all directions in DB
			.catch((error) => { console.log(error) })

		await modelUserInfo.aggregate([ // Subordinates by default
			{ $match: {manager: req.session._id} },
			{ $project: { _id: 1, name: 1, } },
		])
		.then((dataSubs) => {
			subordinates = dataSubs // Get all the subordinates
		})
		.catch((error) => {
			console.log(error)
		})
		.finally(() => {
			//Reportes route
			return res.status(200).render('metrics', {
				title_page: 'UTNA - Metricas',
				session: req.session,
				directions: directions,
				areas: areas,
				subordinates: subordinates,
			})
		})
	}
}

function data(req, res) {
	let search = {}, sumTemp,
		year = DATE.getFullYear()

	if('_id' in req.body) {
		search._id = (req.body._id).trim()
		if(req.session.category > 1)
			search.manager = req.session._id
	}
	else if('area' in req.body) {
		search.area = req.body.area
	}
	else if('direction' in req.body) {
		search.direction = req.body.direction
	} 
	else {
		search.manager = req.session._id
	}

	let match = {}
	match[`records.${DATE.getFullYear()}.disabled`] = { $exists: false }

	modelEvaluation.aggregate([
		{ $match: { match } },
		{ $lookup: {
			from: 'user_infos',
			pipeline: [
				{ $match : search },
				{ $project: { name: 1 } }
			],
			localField: '_id',
			foreignField: '_id',
			as: 'info',
		} }, {
			$replaceRoot: {
				newRoot: {
					$mergeObjects: [
						{ $arrayElemAt: [ '$info', 0 ] }, '$$ROOT'
					]
				}
			}
		}, {
			$project: {
				_id : { $cond: { if: { $eq: [ '$info', [] ] }, then: '$$REMOVE', else: '$_id' } },
				records : { $cond: { if: { $eq: [ '$info', [] ] }, then: '$$REMOVE', else: '$records' } },
				name : { $cond: { if: { $and: [ { $eq: [ '$info', [] ] }, { $ne: ['$name', null] } ] }, then: '$$REMOVE', else: '$name' } }
				//Get field directly from array = fieldExample: { $arrayElemAt: [ '$fieldExample.fieldInside', 0 ] }
			}
		}
	])
	.then(async (data) => { //🟢
		/*	Data Example:

			_id: "0000"
			name: "Name"
			records: {
				2022: {
					score: 99.9
					answers: [...]
					area: 1
				}
			}
		*/
		if(data) {
			// filter empty objects
			data = data.filter(value => Object.keys(value).length !== 0)

			let average = 0, sumTemp = 0,
				years = [], records =  [], subordinates = [],
				histCounter =  [[0, 0, 0, 0, 0],[0, 0, 0, 0, 0]],
				divideBy = 0

			if(req.body._id == null || req.body._id == undefined)
				await modelUserInfo.aggregate([
					{ $match: search },
					{ $project: {
						_id: 1,
						name: 1,
					} },
				])
				.then((dataSubs) => {
					subordinates = dataSubs // Get all the subordinates
				})
				.catch((error) => {
					console.log(error)
				})
			else subordinates = null

			for(let i=0; i<5; i++) {
				let yrs = String(parseInt(year)-(4-i))

				years[i] = yrs
				for(let j in data) {
					if('records' in data[j]) {
						if(String(yrs) in data[j].records) {
							if(!('disabled' in data[j].records[yrs])) {
								histCounter[0][i] += data[j].records[String(yrs)].score
								histCounter[1][i]++
							}
						}
					}
				}
				histCounter[0][i] = parseFloat((histCounter[0][i])).toFixed(2)

				records[i] = (histCounter[0][i] === 0 || histCounter[1][i] === 0)
					? 0 : parseFloat((histCounter[0][i] / histCounter[1][i]).toFixed(1))
				sumTemp += records[i]

				if(records[i] != 0) divideBy++
			}
			// Get average just for only for years with evaluations
			average = parseFloat((sumTemp / divideBy).toFixed(1))

			return res.json({
				data: {
					total: (average === NaN) ? null : average,
					log: {
						years: years,
						records: records
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
		console.log(error)
		return res.json({
			msg: 'Algo salio mal.\n\r¡No te alarmes! Todo saldra bien.',
			status: 404,
			snack: true,
			notiType: 'error',
			error: error
		})
	})
}

async function getAllOf(req, res) {
	let search = {}, uAggregate,
		yearSel = ('FORCE_YEAR_TO' in req.body) ? req.body.FORCE_YEAR_TO : currYear

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
		.catch(error => { console.log(error); failure() })
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

	const DATA = await req.body
	const doc = new pdf.Document({ // Vertical letter
		width:   612, // 21.59 cm
		height:  792, // 27.94 cm
		padding: 32
	})

	const polyJPEG = await sharp(new Buffer.from(DATA.poly, 'base64')).resize({height: 400})
		.flatten({ background: '#ffffff' }).jpeg().toBuffer()

	const theRecords = {
		past: await getAllOf({body:{search:DATA.barSearch, FORCE_YEAR_TO:parseInt(currYear)-1}}, undefined),
		curr: await getAllOf({body:{search:DATA.barSearch, FORCE_YEAR_TO:currYear}}, undefined)
	}

	try {
		const header = doc.header().table({widths: [150, 240, 150], borderWidth: 0})
		const hTable = header.row()

		hTable.cell({ paddingLeft: 0.75*pdf.cm, paddingRight: 0.75*pdf.cm, paddingTop: 0.5*pdf.cm, paddingBottom: 0.5*pdf.cm })
			.text(req.session.name)
		hTable.cell().text('')
		hTable.cell({ paddingLeft: 0.75*pdf.cm, paddingRight: 0.75*pdf.cm, paddingTop: 0.5*pdf.cm, paddingBottom: 0.5*pdf.cm })
			.text(`${DATE.getDate()}/${DATE.getMonth()+1}/${currYear}`, {textAlign: 'right'})

		if(req.body.mode == 'all' || req.body.mode == 'poly') {
			// --------------------------- Comparison graph page --------------------------- //
			const img = new pdf.Image(polyJPEG)
			doc.cell({ paddingTop: 0.4*pdf.cm, paddingBottom: 0.5*pdf.cm }).text({ textAlign: 'center', fontSize: 14 })
				.add(`Comparación de areas (${parseInt(currYear)-1} - ${parseInt(currYear)})`)
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
				.text({ textAlign: 'center', fontSize: 10 }).add(`Porcentaje (${parseInt(currYear)-1})`)
			tHeader.cell({ paddingLeft: 0.75*pdf.cm, paddingRight: 0.75*pdf.cm, paddingTop: 5, paddingBottom: 5})
				.text({ textAlign: 'center', fontSize: 10 }).add(`Porcentaje (${currYear})`)


			for(let i in theRecords.curr) {{
				const row = tableC.row()
				row.cell({ paddingTop: 2, paddingBottom: 2, paddingLeft: 0.35*pdf.cm }).text({ textAlign: 'left', fontSize: 9 })
					.add(theRecords.curr[i].desc)
				row.cell({ paddingTop: 2, paddingBottom: 2, })
					.text({ textAlign: 'center', fontSize: 9, color: (theRecords.past[i].length != 0) ? 0x000000 : 0x505050 })
					.add((theRecords.past[i].length != 0) ? theRecords.past[i].total / theRecords.past[i].length : 'N.A.')
				row.cell({ paddingTop: 2, paddingBottom: 2, })
					.text({ textAlign: 'center', fontSize: 9, color: (theRecords.curr[i].length != 0) ? 0x000000 : 0x505050 })
					.add((theRecords.curr[i].length != 0) ? theRecords.curr[i].total / theRecords.curr[i].length : 'N.A.')
			}}

			doc.pageBreak()
		}

		if(req.body.mode == 'all' || req.body.mode == 'mono') {
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
		console.log(error)
		await doc.end() // Close file
		throw res.send(null)
	}

	res.append('filename', 'output.pdf')
	await doc.pipe(res)
	return await doc.end() // Close file
}

module.exports = {
	root,
	data,
	getAllOf,
	printer
}