const morgan = require('morgan')
const app = require('./app/app')
const CONFIG = require('./app/config/config')
const base = require('./app/config/base')

base.connect()

app.listen(CONFIG.PORT, function(error) {
    if(error) return console.log(error)
    console.log(`\x1b[35m[server]\x1b[34m Running App on Port: \x1b[36m${CONFIG.PORT}\x1b[0m \n`)
})

app.use(morgan('dev'))