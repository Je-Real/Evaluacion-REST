const mongoose = require('mongoose')

//Schema for users info colecction
const informationSchema = new mongoose.Schema({
	_id:{ type:Number },
	first_name:{ type:String, required: true },
	last_name:{ type:String, required: true },

	area:{ type:Number, required: true, min:1 },
	direction:{ type:Number, required: true, min:-1 },
	position:{ type:Number, required: true, min:-1 },
	category:{ type:Number, required: true },

	enabled:{ type:Boolean, default: true },

	//blame
	edited: { type: Object }
})

module.exports = mongoose.model('user_info', informationSchema)