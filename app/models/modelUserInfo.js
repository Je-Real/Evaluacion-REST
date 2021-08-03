const mongoose = require('mongoose')

const informationSchema = new mongoose.Schema({
    _id:{ type:String },
    first_name:{ type:String, required:true },
    last_name:{ type:String, required:true },
    address:{
        street: { type:String, required:true },
        num: { type:Number, required:true },
        postal_code: { type:Number, required:true }
    },
    area:{ type:Number, required:true },
    career:{ type:Number, required:true },
    b_day:{ type:Date, required:true }
})

module.exports = mongoose.model('Info', informationSchema)