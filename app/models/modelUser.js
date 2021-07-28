const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    user:{ type:String, required:true },
    pass:{ type:Number, required:true },
    last_conn:{ type:Date, default:Date.now() }
})

module.exports = mongoose.model('User', UserSchema)