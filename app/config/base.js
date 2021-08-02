//Import db configs & mongoose for db connection 
const CONFIG = require('./config')
const mongoose = require('mongoose')

//Export connection with db
module.exports = {
    //Set a null connection
    connection:null,
    //Try to connect to db
    connect: function() {
        if(this.connection) {
            return this.connect
        }
        // useCreateIndex is caused by modelUser.Info
        return mongoose.connect(CONFIG.DB, 
            {useNewUrlParser: true, useUnifiedTopology: true, /*useCreateIndex: true*/}).then(conn => {
            this.connection = conn
            //console.log('Connection... OK')
        }).catch(error => console.log('Error in DB connection: ', error))
    }
}