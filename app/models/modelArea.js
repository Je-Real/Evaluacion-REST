const mongoose = require('mongoose')

//Schema for area colecction
const areaSchema = new mongoose.Schema({
    n:{ type:Number, required:true },
    desc:{ type:String, required:true }
})

module.exports = mongoose.model('area', areaSchema)