const mongoose = require('mongoose')

//Schema for evaluation colecction
const EvaluationSchema = new mongoose.Schema({
    _id:{ type:String },
    records:{ type:Object, required:true }
})

module.exports = mongoose.model('Evaluation', EvaluationSchema)