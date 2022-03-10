const mongoose = require('mongoose')

//Schema for users info colecction
const informationSchema = new mongoose.Schema({
	_id:{ 	type: String },
	name:{ 	type: String, required: true },
	
	manager:{ 	type: String, required: true, default: 'undefined' },
	area:{ 		type: String, required: true, /*min:-1*/ },
	direction:{ type: String, required: true, /*min:-1*/ },
	position:{ 	type: String, required: true, /*min:-1*/ },
	category:{ 	type: String, required: true, /*min:-1*/ },

	enabled:{ 	type: Boolean, default: true },

	// blame system™
	log: { type: Object }
})

module.exports = mongoose.model('user_info', informationSchema)