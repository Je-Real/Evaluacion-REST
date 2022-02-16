const modelUserInfo = require('../../models/modelUserInfo')

const crypto = require('crypto-js')

const DATE = new Date()

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let usersData
	
	if(req.session.lvl == -1) {
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
			}, { 
				$unset: [ '__v' ]
			}
		])
		.then(async (data) => {
			// Show data in the front end
			usersData = data
		})
		.catch(error => {
			console.error(error)
			usersData = null
		})
		.finally(() => {
			//Root route
			return res.status(200).render('secret/adminCtrl', {
				title_page: 'UTNA - Evaluacion',
				session: req.session,
				usersData: usersData,
				records: false,
			})
		})
	}
	else {
		res.redirect('/error/404')
	}

}

module.exports = {
	root
}