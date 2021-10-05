const mongoose = require('mongoose')

//Schema for department colecction
const departmentSchema = new mongoose.Schema({
    area:{ type:Number, required:true },
    n:{ type:Number, required:true },
    desc:{ type:String, required:true }
})

module.exports = mongoose.model('department', departmentSchema)