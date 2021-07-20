//Import express & routes

/* Dependencies
 * "body-parser": "^1.19.0",
 * "boostrap": "^2.0.0",
 * "ejs": "^3.1.6",
 * "express": "^4.17.1",
 * "mongoose": "^5.12.14",
 * "morgan": "^1.10.0" */

const express = require('express')
const routeEval = require('./routes/routeEval')
const path = require('path');

const app = express()

//Do N O T delete this 2 rows or else...
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//Root route
app.use('/evaluacion', routeEval)

//Export and execute the aplication
module.exports = app