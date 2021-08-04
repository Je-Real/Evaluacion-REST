const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const crypto = require('crypto-js')
const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
	//Login route
	return res.status(200).render('session/login')
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
}

async function logIn(req, res) {
	//LogIn validator
	await modelUser.find({ _id: req.body._id })
		.then((data) => {
			if (data.length) { //if data 👍
				//Encryption
				var compare = crypto.AES.decrypt(data[0].pass, req.body._id)

				if (compare.toString(crypto.enc.Utf8) === req.body.pass) { //🟢
					modelUser.updateOne({ user: req.body._id }, { last_conn: Date.now() })
						.then(() => {
							modelUserInfo.find({ _id: req.body._id })
								.then(data => {
									localStorage.setItem('user', req.body._id)
									//Response success for AJAX
									return res.end(JSON.stringify({
										msg: 'Sesión iniciada. Bienvenido '+data.first_name+'.', 
										status: 200,
										noti: true
									}))
								})
								.catch(() => {
									return res.end(JSON.stringify({
										msg: 'Error de busqueda de usuario. Intenta de nuevo mas tarde.', 
										status: 404,
										noti: true
									}))
								})
						})
						.catch(() => {
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
		.catch(() => { //if error 🤬
			return res.end(JSON.stringify({
				msg: 'Error del servidor.\n\r¡No te alarmes! Todo saldra bien.', 
				status: 500,
				error: true
			}))
		})
}

module.exports = {
	root,
	logIn,
	logOut,
}