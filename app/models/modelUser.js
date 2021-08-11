const mongoose = require('mongoose')

//Schema for users colecction
const UserSchema = new mongoose.Schema({
    _id:{ type:String },
    pass:{ type:String, required:true },
    last_conn:{ type:Date, default:Date.now(), required:true },
    level:{ type:Number, default:4 },
    enabled:{ type:Boolean, default:true }
})

module.exports = mongoose.model('User', UserSchema)