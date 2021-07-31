const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    user:{ type:String, required:true },
    pass:{ type:String, required:true },
    date:{ type:Date, default:Date.now() }
})

module.exports = mongoose.model('User', UserSchema)