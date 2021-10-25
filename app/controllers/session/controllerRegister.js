const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const modelContract = require('../../models/modelContract')
const modelArea = require('../../models/modelArea')
const modelDepartment = require('../../models/modelDepartment')
const modelCareer = require('../../models/modelCareer')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Registration <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
    var session

    if(!req.session.user && !req.session.lvl) { // No session 😡
        session = null
    } else { // Session 🤑
        session = req.session
    }

	await modelContract.find({})
    .then(async (dataC) => {
		await modelArea.find({})
    	.then(async (dataA) => {
			await modelDepartment.find({})
    		.then(async (dataD) => {
				await modelCareer.find({})
    			.then(async (dataCr) => {
					return res.status(200).render('registro', {
						contracts: dataC,
						area: dataA,
						depa: dataD,
						care: dataCr,
						session: session
					})
				})
			})
        })
    })
    .catch((error) => {
        console.log(error)
        return res.status(200).render('registro', {session: session})
    })
}

async function signIn(req, res) {
	//SignIn validator
	await modelUser.find({ _id: req.body._id })
	.then((dataUser) => {
		if (dataUser.length) { //if data 👍
			return res.end(JSON.stringify({
				msg: '¡Ya existe usuario con ese id!',
				status: 500,
				noti: true
			}))
		} else { //if no data 🥶
			//Encryption
			req.body.pass = crypto.AES.encrypt(req.body.pass, req.body._id).toString()

			req.body.address = {
				street : req.body.street,
				num : req.body.num,
				postal_code : req.body.postal_code
			}

			//Save data
			new modelUserInfo(req.body).save()
			.then(() => { //🟢
				new modelUser(req.body).save()
				.then(() => { //🟢
					return res.end(JSON.stringify({
						msg: '¡Registrado correctamente!',
						status: 200,
						noti: true
					}))
				})
				.catch((error) => { //🔴
					console.log(error)
					return res.end(JSON.stringify({
						msg: 'No se puede registrar usuario.\r\nIntentalo más tarde.',
						status: 500,
						noti: true
					}))
				})
			})
			.catch((error) => { //🔴
				console.log(error)
				return res.end(JSON.stringify({
					msg: 'No se puede registrar usuario.\r\nIntentalo más tarde.',
					status: 500,
					noti: true
				}))
			})
		}
	})
	.catch((error) => { //if error 🤬
		console.log('Error:',error)
		return res.end(JSON.stringify({
			msg: 'Error en servidor.',
			status: 500,
			noti: true
		}))
	})
	//NUNCA colocar un return fuera del catch
	//NEVER place a return outside the catch
}

async function getManager(req, res) {
	var search

	if(parseInt(req.query.level)-1 == 0) {
		search = { level: parseInt(req.query.level)-1 }
	} else if(req.query.department > 0) {
		search = {
			area: parseInt(req.query.area),
			level: parseInt(req.query.level)-1
		}
	} else if(req.query.career > 0) {
		search = {
			area: parseInt(req.query.area),
			department: parseInt(req.query.department),
			level: parseInt(req.query.level)-1
		}
	} else {
		search = {
			area: parseInt(req.query.area),
			department: parseInt(req.query.department),
			career: parseInt(req.query.career),
			level: parseInt(req.query.level)-1
		}
	}

	console.log(search);
	
	await modelUserInfo.find(search)
	.then((data) => { //🟢
		var info = []

		for(i in data) {
			info[i] = {
				_id: data[i]._id,
				level: data[i].level,
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