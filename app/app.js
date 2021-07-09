const express = require('express')
const routeDulces = require('./routes/routeDulces')
const routeVinos = require('./routes/routeVinos')

const app = express()

app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use('/dulces', routeDulces)
app.use('/vinos', routeVinos)

module.exports = app