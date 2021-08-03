const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const crypto = require('crypto-js')
const { json } = require('body-parser')

// >>>>>>>>>>>>>>>>>>>>>> Registration <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
	//Registration route
	return res.status(200).render('session/register')
}

function signIn(req, res) {
	//SignIn validator
	modelUser.find({ _id: req.body._id })
		.then((data) => {
			if (data.length) { //if data 👍
				console.log('Existe usuario')
				//return res.status(200).redirect('/registro') //Cambiar por mensaje
			} else { //if no data 🥶
				//Encryption
				req.body.pass = crypto.AES.encrypt(req.body.pass, req.body._id).toString()

				req.body.address = {
					street : req.body.street,
					num : req.body.number,
					postal_code : req.body.postal_code
				}

				//Save data
				new modelUser(req.body).save()
					.then((data) => { //🟢
						req = null
						return res
					})
					.catch((error) => { //🔴
						req = null
						//console.log('Cannot save user:', error)
					})

				new modelUserInfo(req.body).save()
					.then((data) => { //🟢
						req = null
						return res.status(200).redirect('/inicio')
					})
					.catch((error) => { //🔴
						req = null
						//console.log('Cannot save info:', error)
					})
			}
		})
		.catch((error) => { //if error 🤬
			console.log('Error:', error)
		})
	//NUNCA colocar un return fuera del catch
	//NEVER place a return outside the catch
}

module.exports = {
	root,
	signIn,
}