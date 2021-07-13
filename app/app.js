//Import express & routes
const express = require('express')
const routeEval = require('./routes/routeEval')

const app = express()

//Do N O T delete this 2 rows or else...
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Root route
app.use('/evaluation', routeEval)

//Export
module.exports = app