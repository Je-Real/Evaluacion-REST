const mongoose = require('mongoose')

//Schema for colecction users
const PostalCodeSchema = new mongoose.Schema({
    d_codigo:{ type:Number, required:true },
    D_mnpio:{ type:String, required:true },
    d_estado:{ type:String, required:true }
})

module.exports = mongoose.model('postal_code', PostalCodeSchema)