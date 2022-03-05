const mongoose = require('mongoose')

//Schema for position colection
const positionSchema = new mongoose.Schema({
    _id:{ type:Number },
    description:{ type:Array, required:true },

    //blame
	edited: { type: Object }
})

module.exports = mongoose.model('position', positionSchema)