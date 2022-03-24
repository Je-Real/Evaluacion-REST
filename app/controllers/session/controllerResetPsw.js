const modelUser = require('../../models/modelUser')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
async function reset(req, res) {
	await modelUser.find({ _id: req.body._id })
	.then((dataUser) => {
		if(dataUser.length) { //if data 👍
            //Encryption
			dataUser.pass = crypto.AES.encrypt(req.body.pass, req.body._id).toString()

			//Save data
			new modelUser(dataUser).save()
			.then(() => { //🟢
				return res.json({
					msg: '¡Contraseña actualizada correctamente!',
					status: 200,
					snack: true
				})
			})
			.catch((error) => { //🔴
				console.error(error)
				return res.json({
					msg: 'No se puede actualizar contraseña.\r\nIntentalo más tarde.',
					status: 500,
					snack: true
				})
			})
		} else { //if no data 🥶
			return res.json({
				msg: '¡No se encontro usuario!',
				status: 404,
				snack: true
			})
		}
	})
	.catch((error) => { //if error 🤬
		console.error('Error:',error)
		return res.json({
			msg: 'Error en servidor.',
			status: 500,
			snack: true
		})
	})
}

module.exports = {
	reset,
}