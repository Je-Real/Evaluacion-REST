const mongoose = require('mongoose')

const DulcesSchema = new mongoose.Schema({
    nombre:{ type:String, required:true },
    precio:{ type:Number, required:true },
    existencia:{ type:Number, default:5 },
    descripcion:{ type:String }
})

module.exports = mongoose.model('Dulce', DulcesSchema)