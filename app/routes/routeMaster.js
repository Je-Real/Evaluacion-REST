const { Router } = require('express')
const router = Router()

const controllerLayoutStatic = require('../controllers/controllerEvaluation')
const controllerCtrlPanel = require('../controllers/controllerCtrlPanel')
const controllerMetrics = require('../controllers/controllerMetrics')

const controllerLogin = require('../controllers/session/controllerLogin')
const controllerResetPsw = require('../controllers/session/controllerResetPsw')
const controllerRegister = require('../controllers/session/controllerRegister')

const controllerAdminCtrl = require('../controllers/secret/controllerAdminCtrl')

const controller404 = require('../controllers/error/controller404')
const controller401 = require('../controllers/error/controller401')
const controller500 = require('../controllers/error/controller500')

const util = require('../controllers/util/util')

router //👇

// Index
.get('/home', controllerCtrlPanel.root)
.get('/home/evaluation-pdf/:id', controllerCtrlPanel.pdfEvalFormat)
.get('/home/manage-user/:id/:action', controllerCtrlPanel.manageUserEvaluation)

// Reports
.get('/metrics', controllerMetrics.root)
.post('/metrics', controllerMetrics.getOne) // Individual metrics
//.post('/metrics/all', controllerMetrics.getAll) // Comparison metrics (bar chart)
.post('/metrics/print', controllerMetrics.printer)

// Survey / Evaluation
.get('/evaluation', controllerLayoutStatic.root)
.post('/evaluation', controllerLayoutStatic.post)

// Users
.post('/session/sign-in', controllerRegister.signUp)
.post('/session/log-in', controllerLogin.logIn)
.get('/session/log-out', controllerLogin.logOut)
.post('/session/lang', controllerLogin.lang)

.post('/admin-control/super-user', controllerRegister.superUser)

// Recovery password
.post('/session/reset-psw', controllerResetPsw.reset)

// Shhh... it's a secret🤐
//.get('/secret/test', controllerTest.root)
//.get('/secret/test/download', controllerTest.saveAsExcel)
//.get('/secret/user-generator', controllerUserGenerator.root)

// Admin control
.get('/admin-control', controllerAdminCtrl.root)
.post('/admin-control/search', controllerAdminCtrl.search)
.post('/admin-control/update', controllerAdminCtrl.update)

// (Utils) Fuzzy search 
.post('/admin-control/fuzzy-find', controllerRegister.fuzzySearch)

// Errors handlers (Always keep this at the end)
.get('**', controller404.root)
.get('/error/401', controller401.root)
.get('/error/500', controller500.root)

module.exports = router
