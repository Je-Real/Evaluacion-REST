const { Router } = require('express')
const router = Router()
const fs = require('fs')

const controllerIndex = require('../controllers/controllerInicio')
const controllerLayoutStatic = require('../controllers/controllerEvaluacion')
const controllerTabla = require('../controllers/controllerTabla')
const controllerMetricas = require('../controllers/controllerMetricas')

const controllerLogin = require('../controllers/session/controllerLogin')
const controllerResetPsw = require('../controllers/session/controllerResetPsw')
const controllerRegister = require('../controllers/session/controllerRegister')

const controllerUserGenerator = require('../controllers/secret/controllerUserGenerator')

const controller404 = require('../controllers/error/controller404')
const controller401 = require('../controllers/error/controller401')
const controller500 = require('../controllers/error/controller500')

router

// Index
.get('/inicio', controllerTabla.root)
.get('/inicio/evaluation-pdf/:id', controllerTabla.pdfEvalFormat)
.get('/inicio/test', controllerIndex.test)

// Reports
.get('/metricas', controllerMetricas.root)
.post('/metricas', controllerMetricas.data)

// Survey
.get('/evaluacion', controllerLayoutStatic.root)
.post('/evaluacion', controllerLayoutStatic.post)

// Register
.get('/registro', controllerRegister.root)
.get('/registro/manager', controllerRegister.getManager)

// Recovery password
.post('/reset-psw', controllerResetPsw.reset)

// Users
.post('/sesion/nuevo-usuario', controllerRegister.signIn)
.post('/sesion/login', controllerLogin.logIn)
.get('/sesion/logout', controllerLogin.logOut)

// Shh... it's a secret🤐
.get('/secret/user-generator', controllerUserGenerator.root)

// Errors handlers (Always keep this at the end)
.get('**', controller404.root)
.get('/error/401', controller401.root)
.get('/error/500', controller500.root)

module.exports = router
