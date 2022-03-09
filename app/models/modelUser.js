const mongoose = require('mongoose')
const DATE = new Date()

// yyyy-mm-dd
const FORMAT_DATE = `${ DATE.getFullYear() }-`+
	`${ (String(DATE.getMonth()+1).length == 1) ? '0'+(DATE.getMonth()+1) : DATE.getMonth()+1 }-`+
	`${ (String(DATE.getDate()).length == 1) ? '0'+(DATE.getDate()) : DATE.getDate() }`
// hh:mm
const FORMAT_HOUR = `${ (String(DATE.getHours()).length == 1) ? '0'+(DATE.getHours()) : DATE.getHours() }:`+
	`${ (String(DATE.getMinutes()).length == 1) ? '0'+(DATE.getMinutes()) : DATE.getMinutes() }`

//Schema for users colecction
const UserSchema = new mongoose.Schema({
	_id:{ type: String },
	pass:{ type: String, required: true },
	last_conn:{
		date: { type: String, required: true, default:FORMAT_DATE },
		time: { type: String, default:FORMAT_HOUR }
	},
	created:{
		date: { type: String, required: true, default:FORMAT_DATE },
		time: { type: String, default:FORMAT_HOUR }
	},
	enabled:{ type: Boolean, default: true },

	// blame system™
	log: { type: Object }
})

module.exports = mongoose.model('User', UserSchema)