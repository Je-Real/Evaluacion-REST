const mongoose = require('mongoose')

//Schema for colecction users
const UserSchema = new mongoose.Schema({
    user:{ type:String, required:true },
    pass:{ type:String, required:true },
    last_conn:{ type:Date, default:Date.now() },
    enabled:{ type:Boolean, default:true, required:true }
})

module.exports = mongoose.model('User', UserSchema)
    //👇 Cause DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead. 👇
    //mongoose.model('Info', informationSchema) 
