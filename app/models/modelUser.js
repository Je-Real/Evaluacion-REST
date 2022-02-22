const mongoose = require('mongoose')

//Schema for users colecction
const UserSchema = new mongoose.Schema({
	_id:{ type:String },
	pass:{ type:String, required:true },
	last_conn:{
		date: { type:String, required:true },
		time: { type:String }
	},
	created:{
		date: { type:String, required:true },
		time: { type:String }
	},
	enabled:{ type:Boolean, default:true }
})

module.exports = mongoose.model('User', UserSchema)