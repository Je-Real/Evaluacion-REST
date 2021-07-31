//Export db configs
module.exports = {
    PORT: process.env.PORT || 3000,
    DB: process.env.DB || 'mongodb://localhost:27017/evaluacion' //modify this when server is in another pc
}