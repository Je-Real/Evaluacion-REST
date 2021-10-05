const mongoose = require('mongoose')

//Schema for users info colecction
const informationSchema = new mongoose.Schema({
    _id:{ type:String },
    first_name:{ type:String, required:true },
    last_name:{ type:String, required:true },
    level:{ type:Number, default:6 },
    area:{ type:Number, required:true, min:1 },
    department:{ type:Number, min:-1 },
    career:{ type:Number, min:-1 },
    contract:{ type:Number },
    address:{
        street: { type:String, required:true },
        num: { type:Number, required:true },
        postal_code: { type:Number, required:true }
    },
    b_day:{ type:Date, required:true }
})

module.exports = mongoose.model('user_info', informationSchema)