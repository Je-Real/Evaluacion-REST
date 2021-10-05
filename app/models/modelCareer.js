const mongoose = require('mongoose')

//Schema for career colection
const careerSchema = new mongoose.Schema({
    department:{ type:Number, required:true },
    n:{ type:Number, required:true },
    desc:{ type:String, required:true }
})

module.exports = mongoose.model('career', careerSchema)