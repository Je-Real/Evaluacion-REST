const modelUser = require('../../models/modelUser')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
async function reset(req, res) {
	if(!('_id' in req.session)) {
		return res.status(401).json({
			msg: Array(
				`Por favor, inicia sesión nuevamente`,
				`Please, log in again`
			)[req.session.lang],
			status: 401,
			snack: true,
			snackType: 'warning'
		})
	}

	await modelUser.findOne({ _id: req.session._id, enabled: { $ne: false } })
	.then((dataUser) => {
		if(dataUser) { //if data 👍
            //Encryption
			let newPass = crypto.AES.encrypt(req.body.pass, req.session._id).toString()

			//Save data
			modelUser.updateOne({ _id: req.session._id }, { $set: {pass: newPass} })
			.then(() => { //🟢
				return res.status(200).json({
					msg: Array(
						'Contraseña actualizada. Cerrando sesión...',
						'Password updated. Logging out...'
					)[req.session.lang],
					status: 200,
					snack: true,
					snackType: 'success'
				})
			})
			.catch((error) => { //🔴
				console.error(error)
				return res.status(500).json({
					msg: Array(
						'No se puede actualizar contraseña. Por favor, contacta con el administrador.',
						'Unable to update password. Please, contact the administrator.'
					)[req.session.lang],
					status: 500,
					snack: true,
					snackType: 'error'
				})
			})
		} else { //if no data 🥶
			return res.status(404).json({
				msg: Array(
					'No se pudo encontrar los datos del usuario. Por favor, contacta con el administrador.',
					'Unable to find the user information. Please, contact the administrator.'
				)[req.session.lang],
				status: 404,
				snack: true,
				snackType: 'error'
			})
		}
	})
	.catch((error) => { //if error 🤬
		console.error(error)
		return res.status(500).json({
			msg: Array(
				'Ocurrió un error en el servidor. Por favor, contacta con el administrador.',
				'An error occurred on the server. Please contact the administrator.'
			)[req.session.lang],
			status: 500,
			snack: true,
			snackType: 'error'
		})
	})
}

module.exports = {
	reset,
}