const modelUser = require('../../models/modelUser')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
async function reset(req, res) {
	await modelUser.find({ _id: req.body._id })
	.then((dataUser) => {
		if(dataUser.length) { //if data 👍
            //Encryption
			dataUser.pass = crypto.AES.encrypt(String(req.body.pass), String(req.body._id)).toString()

			//Save data
			new modelUser(dataUser).save()
			.then(() => { //🟢
				return res.end(JSON.stringify({
					msg: '¡Contraseña actualizada correctamente!',
					status: 200,
					noti: true
				}))
			})
			.catch((error) => { //🔴
				console.log(error)
				return res.end(JSON.stringify({
					msg: 'No se puede actualizar contraseña.\r\nIntentalo más tarde.',
					status: 500,
					noti: true
				}))
			})
		} else { //if no data 🥶
			return res.end(JSON.stringify({
				msg: '¡No se encontro usuario!',
				status: 404,
				noti: true
			}))
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

module.exports = {
	reset,
}