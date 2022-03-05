const crypto = require('crypto-js')
const path = require('path')
const fs = require('fs')

const DATE = new Date();
let rawData

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let booya = []
	
	if(!req.session.user && !req.session.category) { // No session 😡
		return res.status(200).render('login', {
			title_page: 'UTNA - Inicio',
			session: req.session
		})
	} else { // Session 🤑
		fs.readFile(path.join(__dirname, '../../../db/user_generator.json'), 'utf8', (error, data) => {
			if(error) {
				throw console.error(error)
			}
			rawData = JSON.parse(data)
		})

		if(typeof rawData != 'undefined') {
			await generatorFixed(rawData)
			.then((data) => {
				booya = data

				//Root route
				return res.status(200).render('secret/userGenerator', {
					session: session,
					users: booya[0],
					userInfos: booya[1],
					title_page: 'UTNA - Evaluacion',
				})
			})
			.catch((error) => {
				console.error(error)

				//Root route
				return res.status(200).render('secret/userGenerator', {
					session: session,
					users: ['No data'],
					userInfos: ['No data'],
					title_page: 'UTNA - Evaluacion',
				})
			})
		}
	}
}

async function generatorFixed(params) {
	let area, depa, care,
		lvl, user, pass,
		mana, fn, ls, note = null,
		userer = [], inforer = [],
		year = DATE.getFullYear(),
		month = (DATE.getMonth()+1 < 10 && String(DATE.getMonth()+1).length < 2) ? '0'+DATE.getMonth()+1 : DATE.getMonth()+1,
		day = (DATE.getDate() < 10 && String(DATE.getDate()+1).length < 2) ? '0'+DATE.getDate()+1 : DATE.getDate()+1,
		hour = (DATE.getHours() < 10 && String(DATE.getHours()+1).length < 2) ? '0'+DATE.getHours() : DATE.getHours(),
		minutes = (DATE.getMinutes() < 10 && String(DATE.getMinutes()+1).length < 2) ? '0'+DATE.getMinutes() : DATE.getMinutes(),
		seconds = (DATE.getSeconds() < 10 && String(DATE.getSeconds()+1).length < 2) ? '0'+DATE.getSeconds() : DATE.getSeconds(),
		date = year+'-'+month+'-'+day+'T'+hour+':'+minutes+':'+seconds+':000Z'
		
	
	try {
		// Fixed generator
		for(i in params) {
			
			if((typeof params[i].level == 'number') &&
				(typeof params[i].area == 'number') &&
				(typeof params[i].direction == 'number')) {
				mana = params[i].manager
				
				area = params[i].area
				depa = params[i].direction
				care = params[i].position
				lvl = params[i].level
	
				fn = params[i].first_name
				ls = params[i].last_name
				
				if('note' in params[i]) note = params[i].note
				else note = null
			} else throw params[i]

			user = 'R00'+(i)
			pass = crypto.AES.encrypt(user, user).toString()

			userer[i] = {
				_id: user,
				last_conn: {
					$date: date
				},
				created: {
					$date: date
				},
				enabled: true,
				pass: pass
			}

			inforer[i] = {
				_id: user,
				first_name: fn,
				last_name: ls,
				level: lvl,
				area: area,
				department: depa,
				career: care,
				contract: 1,
				manager: mana,
				b_day: {
					$date: "2000-03-14T00:00:00.000Z"
				},
				address: {
					street: 'calle',
					num: 0,
					postal_code: 0
				}
			}
			if(note != null) {
				inforer[i].note = note
			}
		}
		return [userer, inforer]
	} catch (error) {
		throw error
	}
}

function nRandom(min, max) {
	if(min >= max) throw console.log('Minimo y maximo invertidos!')
		return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatorRex(params) {
	let area, depa, care,
		lvl, user, pass,
		fn, ls, mana,
		userer = '[',
		inforer = '[',
		endHandler = ','

	//Random Generator
	for(let i = 0; i < 30; i++) {
		area = nRandom(1, 10)
		switch (area) {
			case 5:
				depa = nRandom(1, 7)
				break;
			case 6:
				depa = nRandom(8, 11)
				break;
			case 8:
				depa = nRandom(12, 16)
				break;
				
			default:
				depa = 0
				break;
		}

		switch (depa) {
			case 12:
				care = nRandom(1, 3)
				break;
			case 13:
				care = nRandom(4, 5)
				break;
			case 14:
				care = nRandom(6, 7)
				break;
			case 15:
				care = nRandom(8, 9)
				break;
			case 16:
				care = nRandom(10, 11)
				break;
		
			default:
				care = 0
				break;
		}

		cont = nRandom(1, 3)
		if(i == 30-1) endHandler = ']'

		//si area no tiene depa entonces es nivel 1 (no depa no care)
		//si area tiene dapa entonces hay nivel 2 (si depa no care)
		//si depa no tiene carrera entonces hay nivel 3 (si depa no care)
		//si depa tiene carrera entonces hay niveles 4 y 5 (si depa si care)

		if(depa == 0 && care == 0) lvl = 1
		else if(depa > 0 && care == 0) lvl = nRandom(2, 3)
		else lvl = nRandom(4, 5)
		
		user = 'user'+(i+30)
		pass = crypto.AES.encrypt(user, user).toString()

		userer = userer + `{
			"_id": "${user}",
			"last_conn": {
				"$date": "2021-09-09T01:24:41.751Z"
			},
			"created": {
				"$date": "2021-09-09T01:24:41.751Z"
			},
			"enabled": true,
			"pass": "${pass}"
			},`

					inforer = inforer +`{
			"_id": "${user}",
			"first_name": "${user}",
			"last_name": "${user}",
			"level": ${lvl},
			"area": ${area},
			"department": ${depa},
			"career": ${care},
			"contract": ${cont},
			"manager": ${mana},
			"b_day": {
				"$date": "2021-08-23T00:00:00.000Z"
			},
			"address": {
				"street": "${user}",
				"num: 0,
				"postal_code: 0
			}
		},`
	}
}

/*function search(req, res, next) {
	//Variable for a bunch of information to search
	let consulta = {}
	//Save the value with its key
	consulta[req.params.key] = req.params.value
	
	//Search route promise
	modelEval.find(consulta)
	.then(eval => {
		if(!eval.length) {
			return next()
		}
		req.body.eval = eval
		return next()
	})
	.catch(error => {
		req.body.error = error
		next()
	})
}*/

module.exports = {
	root
}