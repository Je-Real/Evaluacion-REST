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
			return 0
		})
		.catch(() => {
			localStorage.clear()
			return 1
		})
	return 2
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
									return res.end(
										JSON.stringify({
											success: 'Sesión iniciada. Bienvenido '+data.first_name, 
											status: 200
										}))
								})
								.catch((error) => {
									console.log(error)
									return res.end('{"error" : "Error de busqueda de usuario", "status" : 404}')
								})
						})
						.catch(() => {
							return res.end('{"error" : "Error de busqueda de usuario 1", "status" : 404}')
						})
				} else { //🔴
					return res.end('{"error" : "El usuario o contraseña no coinciden", "status" : 404}')
				}
			} else { //if no data 🥶
				return res.end('{"error" : "El usuario no existe", "status" : 404}')
			}
		})
		.catch(() => { //if error 🤬
			return res.end('{"error" : "No se pudo", "status" : 500}')
		})
}

module.exports = {
	root,
	logIn,
	logOut,
}