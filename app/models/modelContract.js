const mongoose = require('mongoose')

//Schema for contract colecction
const contractSchema = new mongoose.Schema({
    n:{ type:Number },
    desc:{ type:String }
})

module.exports = mongoose.model('contract', contractSchema)