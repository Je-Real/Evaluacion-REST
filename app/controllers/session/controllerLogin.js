const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const crypto = require('crypto-js')

const DATE = new Date()
const currYear = DATE.getFullYear()

// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
async function logIn(req, res) {
	// Force to Uppercase the ID
	req.body._id = String(req.body._id).toUpperCase()

	// LogIn validator
	await modelUser.findOne({ _id: req.body._id }, { _id: 1, pass: 1, enabled: 1 })
	.then((dataUser) => {
		if(dataUser) { // If there is data in dataUser 👍
			if(!dataUser.enabled) {
				return res.end(JSON.stringify({
					msg: 'El usuario o contraseña no coinciden.', 
					status: 404
				}))
			}

			// Users that have session tokens in browser cookies
			if(typeof req.body.pass === 'object') {
				req.body.pass = crypto.AES.decrypt(req.body.pass.token, req.body._id)
				req.body.pass = req.body.pass.toString(crypto.enc.Utf8)
			}
			
			let compare = crypto.AES.decrypt(dataUser.pass, req.body._id)
			
			if(compare.toString(crypto.enc.Utf8) === req.body.pass) { //🟢
				modelUserInfo.find({ _id: req.body._id })
				.then((dataUInfo) => {
					// Update last connection
					modelUser.updateOne({ user: req.body._id }, { $set: {last_conn: Date.now()} })
					.then(() => {
						// Server 🍪🍪🍪
						req.session.user = req.body._id
						req.session.lvl = dataUInfo[0].level
						req.session.first_name = dataUInfo[0].first_name
						req.session.last_name = dataUInfo[0].last_name
						req.session.area = dataUInfo[0].area
						if(String(dataUInfo[0].department).length)
							req.session.department = dataUInfo[0].department
						if(String(dataUInfo[0].career).length)
							req.session.career = dataUInfo[0].career
	
						//Response success for Asynchronous request
						return res.end(JSON.stringify({
							msg: 'Sesión iniciada. Bienvenido '+dataUInfo[0].first_name+'.',
							data: (req.session.lvl == -1) ? null : {
								user:  req.session.user,
								pass: { token: crypto.AES.encrypt(req.body.pass, req.body._id).toString() },
								name: req.session.first_name,
							},
							status: 200
						}))

					})
					.catch((error) => {
						console.log(error)
						//Response error for Asynchronous request
						return res.end(JSON.stringify({
							msg: 'Error de actualización de datos.', 
							status: 500
						}))
					})
				})
				.catch((error) => {
					console.log(error)
					return res.end(JSON.stringify({
						msg: 'Error de búsqueda de usuario. Intenta de nuevo mas tarde.', 
						status: 404
					}))
				})
			} else { //🔴
				return res.end(JSON.stringify({
					msg: 'El usuario o contraseña no coinciden.',
					class: false,
					status: 404
				}))
			}
		} else {
			//if no data 🥶
			return res.end(JSON.stringify({
				msg: 'El usuario o contraseña no coinciden.',
				class: false,
				status: 404
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
	logOut
}