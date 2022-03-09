const mongoose = require('mongoose')

//Schema for evaluation colecction
const EvaluationSchema = new mongoose.Schema({
    _id:{ type: String, required:true },
    records:{ type:Object, required:true },

    // blame system™
	log: { type: Object }
})

module.exports = mongoose.model('Evaluation', EvaluationSchema)