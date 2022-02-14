const modelUser = require('../../models/modelUser')
const modelUserInfo = require('../../models/modelUserInfo')
const modelEvaluation = require('../../models/modelEvaluation')

const crypto = require('crypto-js')

const DATE = new Date()

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let session, usersSessionData
	
	if(!req.session.user && !req.session.lvl) // No session 😡
		session = null
	else // Session 🤑
		session = req.session

	await modelUserInfo.aggregate([
		{
			$lookup: {
				from: 'users',
				pipeline: [
					{ $unset: ['_id'] }
				],
				localField: '_id',
				foreignField: '_id',
				as: 'user_'
			}
		}, {
			$lookup: {
				from: 'evaluations',
				pipeline: [
					{ $unset: ['_id', '__v'] }
				],
				localField: '_id',
				foreignField: '_id',
				as: 'eval_'
			}
		}, { $unset: [ '__v' ] }
	])
	.then(async (data) => {
		// Show data in the front end
		usersSessionData = data
	})
	.catch(error => {
		console.error(error); usersSessionData = null
	})
	.finally(() => {
		//Root route
		return res.status(200).render('secret/adminCtrl', {
			session: session,
			lvl: req.session.lvl,
			title_page: 'UTNA - Evaluacion',
		})
	})
}

module.exports = {
	root
}