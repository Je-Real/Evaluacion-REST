const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const modelLevel = require('../../models/modelLevel')
const modelEvaluation = require('../../models/modelEvaluation')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
async function logIn(req, res) {
	const date = new Date()
	const year = date.getFullYear()

	//LogIn validator
	await modelUser.find({ _id: req.body._id })
		.then((dataUser) => {
			if (dataUser.length) { //if dataUser 👍
				if(!dataUser[0].enabled) {
					return res.end(JSON.stringify({
						msg: 'El usuario o contraseña no coinciden.', 
						status: 404,
						noti: false
					}))
				}
				//Encryption
				var compare = crypto.AES.decrypt(dataUser[0].pass, req.body._id)

				if (compare.toString(crypto.enc.Utf8) === req.body.pass) { //🟢
					modelUser.updateOne({ user: req.body._id }, { last_conn: Date.now() })
						.then(() => {
							modelLevel.find({ level: dataUser[0].level })
								.then((dataLevel) => {
									modelUserInfo.find({ _id: req.body._id })
										.then(dataUInfo => {
											modelEvaluation.find({ _id: req.body._id })
												.then(dataEval => {
													//Server 🍪🍪🍪
													req.session.user = req.body._id
													req.session.lvl = dataLevel[0].level
													req.session.name = dataUInfo[0].first_name
													req.session.area = dataUInfo[0].area
													req.session.department = dataUInfo[0].department
													req.session.career = dataUInfo[0].career

													//Button evaluation
													try { //true means it's available, false it's deleted
														req.session.evaluation = (dataEval[0].records[year] == undefined) ? true : false
													} catch(error) {
														req.session.evaluation = true
													}
													
													//Response success for AJAX
													return res.end(JSON.stringify({
														msg: 'Sesión iniciada. Bienvenido '+dataUInfo[0].first_name+'.',
														data: {
															user: req.session.user,
															name: req.session.name,
															lvl: req.session.lvl,
														},
														status: 200,
														noti: false
													}))
												})
												.catch((error) => {
													console.log(error)
													return res.end(JSON.stringify({
														msg: 'Error de búsqueda de usuario. Intenta de nuevo mas tarde.', 
														status: 404,
														noti: true
													}))
												})
										})
								})
								.catch((error) => {
									console.log(error)
									return res.end(JSON.stringify({
										msg: 'Error de búsqueda de usuario. Intenta de nuevo mas tarde.', 
										status: 404,
										noti: true
									}))
								})
						})
						.catch((error) => {
							console.log(error)
							return res.end(JSON.stringify({
								msg: 'Error de búsqueda de usuario. Intenta de nuevo mas tarde.', 
								status: 404,
								noti: true
							}))
						})
				} else { //🔴
					return res.end(JSON.stringify({
						msg: 'El usuario o contraseña no coinciden.', 
						status: 404,
						noti: false
					}))
				}
			} else { //if no data 🥶
				return res.end(JSON.stringify({
					msg: 'El usuario no existe. Por favor revisa tu usuario.', 
					status: 404,
					noti: false
				}))
			}
		})
		.catch((error) => { //if error 🤬
			console.log(error)
			return res.end(JSON.stringify({
				msg: 'Error del servidor.\n\r¡No te alarmes! Todo saldrá bien.', 
				status: 500,
				error: true
			}))
		})
	//NUNCA colocar un return fuera del catch
	//NEVER place a return outside the catch
}

async function logOut(req, res) {
	//Login route
	//🍪🚫
	req.session.destroy()
	
	if(req.session == null) {
		return res.end(JSON.stringify({
			msg: 'Sesión finalizada.', 
			status: 200,
			noti: true
		}))
	} else {
		return res.end(JSON.stringify({
			msg: 'Algo salio mal.\n\r¡No te alarmes! Todo saldrá bien.', 
			status: 404,
			noti: true
		}))
	}
}

module.exports = {
	logIn,
	logOut,
}