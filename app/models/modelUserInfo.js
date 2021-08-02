const mongoose = require('mongoose')

const informationSchema = new mongoose.Schema({
    user:{ type:String, required:true, unique:true },
    first_name:{ type:String, required:true },
    last_name:{ type:String, required:true },
    address:{ type:String, required:true },
    area:{ type:Number, required:true },
    career:{ type:Array, required:true },
    b_day:{ type:Date, required:true }
})

module.exports = mongoose.model('Info', informationSchema)