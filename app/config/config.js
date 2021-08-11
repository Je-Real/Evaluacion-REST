//Export db configs
module.exports = {
    PORT: process.env.PORT || 3000,
    DB: process.env.DB || 'mongodb://localhost:27017/eval-UTNA' //In dev
    //DB: process.env.DB || 'mongodb://mongo:27017/eval-UTNA' //Docker mongo
}