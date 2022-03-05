const modelEvaluation = require('../../models/modelEvaluation')
const modelUserInfo = require('../../models/modelUserInfo')
const modelUser = require('../../models/modelUser')

const modelArea = require('../../models/modelArea')
const modelDepartment = require('../../models/modelDirection')
const modelCareer = require('../../models/modelPosition')
const modelContract = require('../../models/modelCategory')

const crypto = require('crypto-js')

const DATE = new Date()

// >>>>>>>>>>>>>>>>>>>>>> Control <<<<<<<<<<<<<<<<<<<<<<
async function root(req, res) {
	let usersData
	
	if(req.session.category == -1) {
		await modelUserInfo.aggregate([
			/*{ $sort: { manager: 1, _id: 1 } },*/
			{
				$lookup: {
					from: "areas",
					pipeline: [ { $unset: ["_id", "n"] } ],
					localField: "area",
					foreignField: "n",
					as: "area",
				}
			}, {
				$unwind: {
					path: "$area",
					preserveNullAndEmptyArrays: true,
				}
			}, {
				$lookup: {
					from: "departments",
					pipeline: [ { $unset: ["_id", "n", "area"] } ],
					localField: "department",
					foreignField: "n",
					as: "department",
				}
			}, {
				$unwind: {
					path: "$department",
					preserveNullAndEmptyArrays: true,
				}
			}, {
				$lookup: {
					from: "careers",
					pipeline: [ { $unset: ["_id", "n", "department"] } ],
					localField: "career",
					foreignField: "n",
					as: "career",
				}
			}, {
				$unwind: {
					path: "$career",
					preserveNullAndEmptyArrays: true
				}
			}, {
				$lookup: {
					from: "users",
					pipeline: [ { $unset: ["_id", "pass"] } ],
					localField: "_id",
					foreignField: "_id",
					as: "user_"
				}
			}, {
				$lookup: {
					from: "evaluations",
					pipeline: [ { $unset: ["_id", "__v"] } ],
					localField: "_id",
					foreignField: "_id",
					as: "eval_"
				},
			}, {
				$set: {
					area: "$area.desc",
					department: "$department.desc",
					career: "$career.desc",
					user_: {
						$cond: {
							if: { $eq: ["$user_", []] },
							then: "$$REMOVE",
							else: { $arrayElemAt: ["$user_", 0] },
						}
					},
					eval_: {
						$cond: {
							if: { $eq: ["$eval_", []] },
							then: "$$REMOVE",
							else: { $arrayElemAt: ["$eval_", 0] }
						}
					}
				}
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
				currYear: DATE.getFullYear()
			})
		})
	}
	else {
		res.redirect('/home/')
	}

}

async function update(req, res) {
	if(req.body) {
		let handler = {status: 200}

		console.log(req.body)

		if('user' in req.body) {
			if('pass' in req.body.user)
				req.body.user.pass = crypto.AES.encrypt(String(req.body.user.pass), String(req.body._id)).toString()

			modelUser.updateOne({ _id: req.body._id}, { $set: req.body.user })
			.catch(error => { handler['user'] = false; console.log(error)})
		}
		
		if('user_info' in req.body)
			modelUserInfo.updateOne({ _id: req.body._id}, { $set: req.body.user_info })
			.catch(error => { handler['user_info'] = false; console.log(error)})

		if('evaluation' in req.body || 'rm_evaluation' in req.body)
			modelEvaluation.updateOne(
				{ _id: req.body._id},
				('evaluation' in req.body)
				? { $set: req.body.evaluation }
				: { $unset: req.body.rm_evaluation }
			).then(data => { console.log(data) })
			.catch(error => { handler['evaluation'] = false; console.log(error)})
		
		return res.end(JSON.stringify(handler))

	} else return res.end({
		status: 418,
		error: 'Without data'
	})
}

module.exports = {
	root,
	update
}