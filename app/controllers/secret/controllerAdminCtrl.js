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
				records: false,
			})
		})
	}
	else {
		res.redirect('/home')
	}

}

module.exports = {
	root
}