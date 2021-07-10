const mongoose = require('mongoose')

const SabritasSchema = new mongoose.Schema({
    codigo:{ type:Number, required:true, unique:true },
    nombre:{ type:String, required:true },
    gramos:{ type:Number, required:true },
    precio:{ type:Number, required:true },
    fecharegistro:{ type:Date, default:Date.now() }
})

module.exports = mongoose.model('Sabritas', SabritasSchema)