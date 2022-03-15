const mongoose = require('mongoose')

//Schema for category colecction
const categorySchema = new mongoose.Schema({
    _id:{ type: Number },
    description:{ type: Array, required:true },

    // blame system™
	log: { type: Object }
}).index({description: 'text'})

module.exports = mongoose.model('categories', categorySchema)