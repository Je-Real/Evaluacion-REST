const mongoose = require('mongoose')

//Schema for evaluation colecction
const EvaluationSchema = new mongoose.Schema({
    _id:{ type:String },
    area: { type:Number, required:true, min:1 },
    department: { type:Number, min:-1 },
    career:{ type:Number, min:-1 },
    records:{ type:Object }
})

module.exports = mongoose.model('Evaluation', EvaluationSchema)