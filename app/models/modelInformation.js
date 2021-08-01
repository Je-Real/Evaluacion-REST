const mongoose = require('mongoose')

//Schema for colecction information
const informationSchema = new mongoose.Schema({
    first_name:{ type:String, required:true },
    last_name:{ type:String, required:true },
    address:{ type:String, required:true },
    area:{ type:Number, required:true },
    career:{ type:Array, required:true },
    b_day:{ type:Date, required:true }
})

module.exports = mongoose.model('Information', informationSchema)