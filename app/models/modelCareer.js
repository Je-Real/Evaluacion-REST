const mongoose = require('mongoose')

//Schema for career colection
const careerSchema = new mongoose.Schema({
    area:{ type:Number },
    n:{ type:Number },
    desc:{ type:String }
})

module.exports = mongoose.model('career', careerSchema)