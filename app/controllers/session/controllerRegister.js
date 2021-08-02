const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const crypto = require('crypto-js')

// >>>>>>>>>>>>>>>>>>>>>> Registration <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
	//Registration route
	return res.status(200).render('session/register')
}

async function signIn(req, res) {
	//SignIn validator
	await modelUser.find({ user: req.body.user })
		.then((data) => {
			if (data.length) { //if data 👍
				console.log('Existe usuario')
				//return res.status(200).redirect('/registro') //Cambiar por mensaje
			} else { //if no data 🥶
				//Encryption
				req.body.pass = crypto.AES.encrypt(req.body.pass, req.body.user).toString()

				//Save data
				new modelUser(req.body).save()
					.then((data) => { //🟢
						console.log(data)
						//return res.status(200).redirect('/inicio')
					})
					.catch((error) => { //🔴
						console.log('Cannot save: ', error)
						//return res.status(200).redirect('/registro')
					})

				new modelUserInfo(req.body).save()
					.then((data) => { //🟢
						console.log(data)
						return res.status(200).redirect('/inicio')
					})
					.catch((error) => { //🔴
						console.log('Cannot save: ', error)
						//return res.status(200).redirect('/registro')
					})
			}
		})
		.catch((error) => { //if error 🤬
			console.log('Error:', error)
			//return res.status(200).redirect('/registro')
		})
	//NUNCA colocar un return fuera del catch
	//NEVER place a return outside the catch
}

module.exports = {
	root,
	signIn,
}