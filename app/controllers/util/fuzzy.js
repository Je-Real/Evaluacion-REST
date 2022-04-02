const modelUserInfo = require('../../models/modelUserInfo')
const modelUser = require('../../models/modelUser')

const modelArea = require('../../models/modelArea')
const modelDirectorate = require('../../models/modelDirectorate')
const modelPosition = require('../../models/modelPosition')
const modelCategory = require('../../models/modelCategory')

/**
 * Fuzzy search for information in some db collection
 * @param {Object} req Object construction
 * @param {String} req.query Text to search 
 * @param {'user'|'user_info'|'area'|'directorate'|'position'|'category'|'areaPosition'} req.collection Collection to search 
 * @returns {Array | Boolean | null} Array objects with data, null if didn't find data or false if ocurred an error
 */
async function fuzzySearch(req = { query: '', collection: '' }) {
	if(req.query.length > 0) {
		const regex = await scaperegex(req.query, (req.collection == 'user_info') ? true : false)

		switch (req.collection) {
			case 'user':
				return await modelUser.aggregate([
					{ $match: {_id: {$regex: regex, $options: 'i'}} },
					{ $project: {_id: 1, last_conn: 1, enabled: 1}}
				])
				.catch(error => {
					console.error(error)
					return false
				})

			case 'user_info':
				return await modelUserInfo.aggregate([
					{
						$match:(isNaN(parseInt(regex)))
						? { $text: { $search: req.query } }
						: { _id: { $regex: regex, $options: 'i' } }
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
					{ $match: {description: { $regex: regex, $options: 'i' }} },
					{ $project: {_id: 1, description: 1}}
				])
				.catch(error => {
					console.error(error)
					return false
				})

			case 'directorate':
				return await modelDirectorate.aggregate([
					{ $match: {description: { $regex: regex, $options: 'i' }} },
					{ $project: {_id: 1, description: 1}}
				])
				.catch(error => {
					console.error(error)
					return false
				})

			case 'position':
				return await modelPosition.aggregate([
					{ $match: {description: { $regex: regex, $options: 'i' }} },
					{ $project: {_id: 1, description: 1}}
				])
				.catch(error => {
					console.error(error)
					return false
				})

			case 'category':
				return await modelCategory.aggregate([
					{ $match: {description: { $regex: regex, $options: 'i' }} },
					{ $project: {_id: 1, description: 1}}
				])
				//.then(data => console.log(data))
				.catch(error => {
					console.error(error)
					return false
				})
			
			case 'areaPosition':
				return await modelUserInfo.aggregate([
					{
						'$lookup': {
							'from': 'positions', 
							'pipeline': [
								{
									'$unset': [
										'__v', '_id', 'log'
									]
								}
							], 
							'localField': 'position', 
							'foreignField': '_id', 
							'as': 'position'
						}
					}, {
						'$set': {
							'position': {
								'$arrayElemAt': [
									'$position.description', 0
								]
							}
						}
					}, {
						'$match': {
							'position': {
								'$regex': regex, 
								'$options': 'i'
							}
						}
					}, {
						'$project': {
							'_id': 1, 
							'name': 1
						}
					}
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

const scaperegex = async(text, vowels = false) => {
	if(text.length) {
		text = text.trim()
		if(vowels)
			text = text.replace(/[aeiouAEIOU]/g, '.')
		text = text.replace(/[àèìòùÀÈÌÒÙáéíóúÁÉÍÓÚüÜ]/g, '.')
		return await text.replace(/[-[\]{}()*+?\/,\\^$|#]/g, '\\$&')
		// Original regex Scape
		// return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
	}
}

module.exports = {
	fuzzySearch,
}