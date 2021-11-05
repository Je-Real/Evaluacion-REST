const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const modelEvaluation = require('../../models/modelEvaluation')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
async function logIn(req, res) {
	const date = new Date()
	const year = date.getFullYear()

	req.body._id = String(req.body._id).toUpperCase()

	//LogIn validator
	await modelUser.find({ _id: req.body._id })
	.then((dataUser) => {
		if (dataUser.length > 0) { //if dataUser 👍
			if(!dataUser[0].enabled) {
				return res.end(JSON.stringify({
					msg: 'El usuario o contraseña no coinciden.', 
					status: 404,
					noti: false
				}))
			}
			//Users that have session tokens in browser cookies
			if(typeof req.body.pass === 'object') {
				req.body.pass = crypto.AES.decrypt(req.body.pass.token, req.body._id)
				req.body.pass = req.body.pass.toString(crypto.enc.Utf8)
			}

			//Encryption
			var compare = crypto.AES.decrypt(dataUser[0].pass, req.body._id)

			if (compare.toString(crypto.enc.Utf8) === req.body.pass) { //🟢
				modelUser.updateOne({ user: req.body._id }, { last_conn: Date.now() })
				.then(() => {
					modelUserInfo.find({ _id: req.body._id })
					.then((dataUInfo) => {
						modelEvaluation.find({ _id: req.body._id })
						.then((dataEval) => {
							//Server 🍪🍪🍪
							req.session.user = req.body._id
							req.session.lvl = dataUInfo[0].level
							req.session.name = dataUInfo[0].first_name
							req.session.area = dataUInfo[0].area
							req.session.department = dataUInfo[0].department
							req.session.career = dataUInfo[0].career
							
							//How to manipulate front-end cookies in back-end
							/*var ini = [req.headers.cookie.search('{'), (req.headers.cookie.search('}'))+1]
							var rest = [
								req.headers.cookie.slice(0, ini[0]),
								req.headers.cookie.slice(ini[1], req.headers.cookie.length)
							]
							var obj = JSON.parse(req.headers.cookie.slice(ini[0], ini[1]))
							obj.pass = dataUser[0].pass
							obj = JSON.stringify(obj)

							req.headers.cookie = rest[0]+obj+rest[1]
							for(let header in req.rawHeaders) {
								if(req.rawHeaders[header].search('user=') != -1) {
									req.rawHeaders[header] = obj
								}
							}

							console.log(req.rawHeaders)
							console.log(req.headers.cookie)*/

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
									pass: {token: dataUser[0].pass},
									name: req.session.name,
									lvl: req.session.lvl
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
			} else { //🔴
				return res.end(JSON.stringify({
					msg: 'El usuario o contraseña no coinciden.', 
					status: 404,
					noti: false
				}))
			}
		} else {
			//if no data 🥶
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
	logOut
}