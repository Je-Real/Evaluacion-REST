//Import express & routes

/* 
 * npm i body-parser boostrap ejs mongoose morgan crypto-js node-localstorage
 */

const express = require('express')
const path = require('path')
const app = express()

const routeMaster = require('./routes/routeMaster') //Require the routes

// set the view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//Do N O T delete this 2 rows or else...
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Use the folder assets for access to /css, /js, /img, etc.
app.use(express.static(path.join(__dirname, 'assets')))

//Routes
app.use('/evaluacion', routeMaster)

//Export and execute the application
module.exports = app