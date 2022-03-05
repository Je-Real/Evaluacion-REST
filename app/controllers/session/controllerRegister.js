const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const modelContract = require('../../models/modelCategory')
const modelArea = require('../../models/modelArea')
const modelDepartment = require('../../models/modelDirection')
const modelCareer = require('../../models/modelPosition')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Registration <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    let session

    if(!req.session.user && !req.session.category) { // No session 😡
        return res.status(200).render('login', {
			title_page: 'UTNA - Inicio',
			session: req.session
		})
    }

	await modelContract.find({})
    .then(async (dataC) => {
		await modelArea.find({})
    	.then(async (dataA) => {
			await modelDepartment.find({})
    		.then(async (dataD) => {
				await modelCareer.find({})
    			.then(async (dataCr) => {
					return res.status(200).render('register', {
						title_page: 'UTNA - Registro',
						contracts: dataC,
						area: dataA,
						depa: dataD,
						care: dataCr,
						session: req.session
					})
				})
			})
        })
    })
    .catch((error) => {
        console.log(error)
        return res.status(200).render('register', {
			session: session
		})
    })
}

async function signIn(req, res) {
	if(req.body) {
		//SignIn validator
		await modelUserInfo.find({ _id: req.body._id }, { _id: 1 })
		.then((dataUser) => {
			if(dataUser.length) { // If the user exists
				return res.end(JSON.stringify({
					msg: ['¡Ya existe usuario con ese ID!', 'There is an user with that ID already!'],
					status: 409,
					noti: true
				}))
			} else {
				//Encryption
				req.body.pass = crypto.AES.encrypt(String(req.body.pass), String(req.body._id)).toString()

				//Save data
				new modelUserInfo(req.body).save()
				.then(() => { //🟢
					if('as_user' in req.body) {
						new modelUser(req.body).save()
						.then((user) => { //🟢
							console.log(user)
							return res.end(JSON.stringify({
								msg: ['¡Registrado correctamente!', 'Successfully registered!'],
								status: 200,
								noti: true
							}))
						})
						.catch((error) => { //🔴
							return res.end(JSON.stringify({
								msg: [
									'No se puede registrar usuario. Inténtalo más tarde.',
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
			console.log('Error:',error)
			return res.end(JSON.stringify({
				msg: ['Error en servidor.', 'Server error'],
				status: 500,
				noti: true
			}))
		})
	} else return res.end({
		status: 418,
		error: ['Sin datos', 'Without data']
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
				first_name: data[i].first_name,
				last_name: data[i].last_name
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
	root,
	signIn,
	getManager,
}