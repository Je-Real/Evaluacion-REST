const mongoose = require('mongoose')

//Schema for contract colecction
const contractSchema = new mongoose.Schema({
    n:{ type:Number, required:true },
    desc:{ type:String, required:true }
})

module.exports = mongoose.model('contract', contractSchema)