//Import db configs & mongoose for db connection 
const CONFIG = require('./config')
const mongoose=require('mongoose')

//Export connection with db
module.exports={
    //Set a null connection
    connection:null,
    //Try to connect to db
    connect: function(){
        if(this.connection){
            return this.connect
        }
        return mongoose.connect(CONFIG.DB).then(conexion => {
            this.connection = conexion
            //console.log('Connection... OK')
        }).catch(error => console.log('Error In Connection: ', error))
    }
}