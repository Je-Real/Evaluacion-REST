const { Router } = require('express')
const router = Router()

const controllerLayoutStatic = require('../controllers/controllerEvaluation')
const controllerCtrlPanel = require('../controllers/controllerCtrlPanel')
const controllerMetrics = require('../controllers/controllerMetrics')

const controllerLogin = require('../controllers/session/controllerLogin')
const controllerResetPsw = require('../controllers/session/controllerResetPsw')
const controllerRegister = require('../controllers/session/controllerRegister')

const controllerUserGenerator = require('../controllers/secret/controllerUserGenerator')
const controllerAdminCtrl = require('../controllers/secret/controllerAdminCtrl')

const controller404 = require('../controllers/error/controller404')
const controller401 = require('../controllers/error/controller401')
const controller500 = require('../controllers/error/controller500')

router //👇

// Index
.get('/home', controllerCtrlPanel.root)
.get('/home/evaluation-pdf/:id', controllerCtrlPanel.pdfEvalFormat)
.get('/home/manage-user/:id/:action', controllerCtrlPanel.manageUserEvaluation)

// Reports
.get('/metrics', controllerMetrics.root)
.post('/metrics', controllerMetrics.data)
.post('/metrics/all', controllerMetrics.getAllOf)
.post('/metrics/print', controllerMetrics.printer)

// Survey / Evaluation
.get('/evaluation', controllerLayoutStatic.root)
.post('/evaluation', controllerLayoutStatic.post)

// Users
.post('/session/sign-in', controllerRegister.signIn)
.post('/session/log-in', controllerLogin.logIn)
.get('/session/log-out', controllerLogin.logOut)
.post('/session/lang', controllerLogin.lang)

// Recovery password
.post('/session/reset-psw', controllerResetPsw.reset)

// Shhh... it's a secret🤐
//.get('/secret/user-generator', controllerUserGenerator.root)

.get('/admin-control', controllerAdminCtrl.root)
.post('/admin-control/search', controllerAdminCtrl.search)
.post('/admin-control/update', controllerAdminCtrl.update)
//.post('/admin-control/find', controllerAdminCtrl.fuzzy)

// Errors handlers (Always keep this at the end)
.get('**', controller404.root)
.get('/error/401', controller401.root)
.get('/error/500', controller500.root)

module.exports = router
