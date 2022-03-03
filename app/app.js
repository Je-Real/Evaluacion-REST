//Import express & routes
const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')

const routeMaster = require('./routes/routeMaster') //Require the routes

// set the view engine to ejs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

//Do N O T delete this 2 rows or else...
//app.use(express.urlencoded({extended:false}))
//app.use(express.json())
app.use(express.urlencoded({extended:false, limit: '10mb'}))
app.use(express.json({limit: '10mb'}))

//Use the folder assets for access to /css, /js, /img, etc.
app.use(express.static(path.join(__dirname, 'assets')))

//Use sessions for users
app.use(session({
    //Do not hex to text
    secret: '65796520747269616e676c652072657665616c656420626974636821',
    saveUninitialized: true,
    resave: true
}))

//Routes
app.use('/', routeMaster)

//Export and execute the application
module.exports = app