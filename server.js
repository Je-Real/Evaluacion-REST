const morgan = require('morgan')
const app = require('./app/app')
const CONFIG = require('./app/config/config')
const base = require('./app/config/base')

base.connect()

app.listen(CONFIG.PORT, function(error){
    if(error) return console.log(error)
    console.log("Server's Port: " + `\x1b[36m%s\x1b[0m`, `${CONFIG.PORT}`)
})


app.use(morgan('dev'))