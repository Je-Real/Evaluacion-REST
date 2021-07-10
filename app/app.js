const express = require('express')
const routeDulces = require('./routes/routeDulces')
const routeSabritas = require('./routes/routeSabritas')

const app = express()

app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use('/dulces', routeDulces)
app.use('/sabritas', routeSabritas)

module.exports = app