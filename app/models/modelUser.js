const mongoose = require('mongoose')

//Schema for colecction users
const UserSchema = new mongoose.Schema({
    _id:{ type:String },
    pass:{ type:String, required:true },
    last_conn:{ type:Date, default:Date.now() },
    level:{ type:Number, default:4 },
    enabled:{ type:Boolean, default:true, required:true }
})

module.exports = mongoose.model('User', UserSchema)