const mongoose = require('mongoose')

//Schema for category colecction
const categorySchema = new mongoose.Schema({
    _id:{ type:Number },
    desc:{ type:String, required:true },

    //blame
	edited: { type: Object }
})

module.exports = mongoose.model('category', categorySchema)