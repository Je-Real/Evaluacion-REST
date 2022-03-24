const modelUserInfo = require('../../models/modelUserInfo')
const modelUser = require('../../models/modelUser')

const modelArea = require('../../models/modelArea')
const modelDirection = require('../../models/modelDirection')
const modelPosition = require('../../models/modelPosition')
const modelCategory = require('../../models/modelCategory')

// Fuzzy search for specific information
async function fuzzySearch(req = { query: '', collection: '' }) {
	if(req.query.length > 0) {
		const regrex = await scapeRegrex(req.query, (req.collection == 'user_info') ? true : false)

		switch (req.collection) {
			case 'user':
				return await modelUser.aggregate([
					{ $match: {_id: {$regex: regrex, $options: 'i'}} },
					{ $project: {_id: 1, last_conn: 1, enabled: 1}}
				])
				.catch(error => {
					console.error(error)
					return false
				})

			case 'user_info':
				return await modelUserInfo.aggregate([
					{
						$match:(isNaN(parseInt(regrex)))
						? { $text: { $search: req.query } }
						: { _id: { $regex: regrex, $options: 'i' } }
					},
					{ $limit: 6 },
					{ $project: {_id: 1, name: 1, enabled: 1}}
				])
				.catch(error => {
					console.error(error)
					return false
				})

			case 'area':
				return await modelArea.aggregate([
					{ $match: {description: { $regex: regrex, $options: 'i' }} },
					{ $project: {_id: 1, description: 1}}
				])
				.catch(error => {
					console.error(error)
					return false
				})

			case 'direction':
				return await modelDirection.aggregate([
					{ $match: {description: { $regex: regrex, $options: 'i' }} },
					{ $project: {_id: 1, description: 1}}
				])
				.catch(error => {
					console.error(error)
					return false
				})

			case 'position':
				return await modelPosition.aggregate([
					{ $match: {description: { $regex: regrex, $options: 'i' }} },
					{ $project: {_id: 1, description: 1}}
				])
				.catch(error => {
					console.error(error)
					return false
				})

			case 'category':
				return await modelCategory.aggregate([
					{ $match: {description: { $regex: regrex, $options: 'i' }} },
					{ $project: {_id: 1, description: 1}}
				])
				//.then(data => console.log(data))
				.catch(error => {
					console.error(error)
					return false
				})

			default:
				return false
		}

	} else return null
}

const scapeRegrex = async(text, vowels = false) => {
	if(text.length) {
		text = text.trim()
		if(vowels)
			text = text.replace(/[aeiouAEIOU]/g, '.')
		text = text.replace(/[àèìòùÀÈÌÒÙáéíóúÁÉÍÓÚüÜ]/g, '.')
		return await text.replace(/[-[\]{}()*+?\/,\\^$|#]/g, '\\$&')
		// Original regrex Scape
		// return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
	}
}

module.exports = {
	fuzzySearch,
}