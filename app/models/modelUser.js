const mongoose = require('mongoose')

//Schema for users colecction
const UserSchema = new mongoose.Schema({
    _id:{ type:String },
    pass:{ type:String, required:true },
    last_conn:{ type:Object, required:true },
    created:{ type:Object, required:true },
    enabled:{ type:Boolean, default:true }
})

module.exports = mongoose.model('User', UserSchema)