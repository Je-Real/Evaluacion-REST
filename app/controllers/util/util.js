const modelUserInfo = require('../../models/modelUserInfo')
const modelUser = require('../../models/modelUser')

const modelArea = require('../../models/modelArea')
const modelDirection = require('../../models/modelDirection')
const modelPosition = require('../../models/modelPosition')
const modelCategory = require('../../models/modelCategory')

// Fuzzy search for specific information
async function fuzzySearch(req = { query: '', collection: '' }) {
	if(req.query.length > 1) {
		const regrex = new RegExp(scapeRegrex(req.query), 'is')

		switch (req.collection) {
			case 'user':
				return await modelUser.find({ _id: regrex }, { _id: 1, last_conn: 1, enabled: 1 })
				.catch(error => {
					console.log(error)
					return false
				})

			case 'user_info':
				return await modelUserInfo.find({ name: regrex } /* { _id: parseInt(regrex) */, { _id: 1, name: 1, enabled: 1 })
				.catch(error => {
					console.log(error)
					return false
				})

			case 'area':
				return await modelArea.find({ description: regrex }, { _id: 1, description: 1 })
				.catch(error => {
					console.log(error)
					return false
				})

			case 'direction':
				return await modelDirection.find({ description: regrex }, { _id: 1, description: 1 })
				.catch(error => {
					console.log(error)
					return false
				})

			case 'position':
				return await modelPosition.find({ description: regrex }, { _id: 1, description: 1 })
				.catch(error => {
					console.log(error)
					return false
				})

			case 'category':
				return await modelCategory.find({ description: regrex }, { _id: 1, description: 1 })
				//.then(data => console.log(data))
				.catch(error => {
					console.log(error)
					return false
				})

			default:
				return false
		}

	} else return null
}

const scapeRegrex = (text) => {
	if(text.length) {
		text = text.trim()
		text = text.replace(/\\/g, '-')
		text = text.replace(/[aeiou]/g, '.')
		return text.replace(/[[\]{}*+?\\^$|#]/g, '')
		//return text.replace(/[-[\]{}()*,+?\\^$|#]/g, '')
		// There are some troubles searching string with the characters () / -
	}
}

module.exports = {
	fuzzySearch,
}