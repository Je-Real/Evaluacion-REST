const mongoose = require('mongoose')

//Schema for department colecction
const departmentSchema = new mongoose.Schema({
    area:{ type:Number },
    n:{ type:Number },
    desc:{ type:String }
})

module.exports = mongoose.model('department', departmentSchema)