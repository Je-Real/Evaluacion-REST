const mongoose = require('mongoose')

//Schema for area colecction
const areaSchema = new mongoose.Schema({
    n:{ type:Number },
    desc:{ type:String }
})

module.exports = mongoose.model('area', areaSchema)