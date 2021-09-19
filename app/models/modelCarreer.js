const mongoose = require('mongoose')

//Schema for carreer colection
const carreerSchema = new mongoose.Schema({
    area:{ type:Number },
    n:{ type:Number },
    desc:{ type:String }
})

module.exports = mongoose.model('carreer', carreerSchema)