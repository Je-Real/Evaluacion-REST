const modelUser = require('../../models/modelUser')
const crypto = require('crypto-js')
const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

// >>>>>>>>>>>>>>>>>>>>>> Login <<<<<<<<<<<<<<<<<<<<<<
function root(req, res) {
	//Login route
	return res.status(200).render('session/login')
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
                            localStorage.setItem('user', req.body._id)

							return res.status(200).redirect('/inicio') //Change it
						})
						.catch((error) => {
							console.log('No se pudo:', error)
							return res.status(200).redirect('/inicio') //Change it
						})
				} else { //🔴
					console.log('No same pass')
					return res.status(200).redirect('/inicio') //Change it
				}
			} else { //if no data 🥶
				console.log('No user')
				return res.status(200).redirect('/inicio') //Change it
			}
		})
		.catch((error) => { //if error 🤬
			console.log('Error:', error)
			return res.status(200).redirect('/inicio') //Change it
		})
}

module.exports = {
	root,
	logIn,
}
