const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const modelLevel = require('../../models/modelLevel')
const crypto = require('crypto-js')
const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
async function logIn(req, res) {
	//LogIn validator
	await modelUser.find({ _id: req.body._id })
		.then((dataUser) => {
			if (dataUser.length || !dataUser[0].enabled) { //if dataUser 👍
				//Encryption
				var compare = crypto.AES.decrypt(dataUser[0].pass, req.body._id)

				if (compare.toString(crypto.enc.Utf8) === req.body.pass) { //🟢
					modelUser.updateOne({ user: req.body._id }, { last_conn: Date.now() })
						.then(() => {
							modelLevel.find({ level: dataUser[0].level })
								.then((dataLevel) => {
									modelUserInfo.find({ _id: req.body._id })
										.then(dataUInfo => {
											localStorage.setItem('user', req.body._id)
											localStorage.setItem('name', dataUInfo[0].first_name)
											localStorage.setItem('lvl', dataLevel[0].level)
											//Response success for AJAX
											return res.end(JSON.stringify({
												msg: 'Sesión iniciada. Bienvenido '+dataUInfo[0].first_name+'.',
												stg: {level: dataLevel[0].level, user: req.body._id},
												status: 200,
												noti: true
											}))
										})
										.catch((error) => {
											console.log(error)
											return res.end(JSON.stringify({
												msg: 'Error de busqueda de usuario. Intenta de nuevo mas tarde.', 
												status: 404,
												noti: true
											}))
										})
								})
								.catch((error) => {
									console.log(error)
									return res.end(JSON.stringify({
										msg: 'Error de busqueda de usuario. Intenta de nuevo mas tarde.', 
										status: 404,
										noti: true
									}))
								})
						})
						.catch((error) => {
							console.log(error)
							return res.end(JSON.stringify({
								msg: 'Error de busqueda de usuario. Intenta de nuevo mas tarde.', 
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
					msg: 'El usuario no existe.', 
					status: 404,
					noti: false
				}))
			}
		})
		.catch((error) => { //if error 🤬
			console.log(error)
			return res.end(JSON.stringify({
				msg: 'Error del servidor.\n\r¡No te alarmes! Todo saldra bien.', 
				status: 500,
				error: true
			}))
		})
	//NUNCA colocar un return fuera del catch
	//NEVER place a return outside the catch
}

async function logOut(req, res) {
	//Login route
	await modelUser.find({ _id: req.body._id })
		.then(() => {
			localStorage.clear()
			return res.end(JSON.stringify({
				msg: 'Sesión cerrada.', 
				status: 200,
				noti: true
			}))
		})
		.catch(() => {
			localStorage.clear()
			return res.end(JSON.stringify({
				msg: 'Algo salio mal.\n\r¡No te alarmes! Todo saldra bien.', 
				status: 404,
				noti: true
			}))
		})
	//NUNCA colocar un return fuera del catch
	//NEVER place a return outside the catch
}

module.exports = {
	logIn,
	logOut,
}