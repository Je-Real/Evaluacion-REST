const { Router } = require('express')
const router = Router()

const controllerIndex = require('../controllers/controllerIndex')
const controllerCharts = require('../controllers/controllerCharts')
const controllerLayoutStatic = require('../controllers/controllerLayoutStatic')
const controllerTables = require('../controllers/controllerTables')
const controllerLayoutSidenav = require('../controllers/controllerLayoutSidenav')

const controller404 = require('../controllers/error/controller404')
const controller401 = require('../controllers/error/controller401')
const controller500 = require('../controllers/error/controller500')

const controllerLogin = require('../controllers/session/controllerLogin')
const controllerPassword = require('../controllers/session/controllerPassword')
const controllerRegister = require('../controllers/session/controllerRegister')

const controllerControl = require('../controllers/secret/controllerControl')


router.get('/inicio', controllerIndex.root)
      .post('/inicio', controllerLogin.logIn)

router.get('/charts', controllerCharts.root)

router.get('/layout-static', controllerLayoutStatic.root)

router.get('/tables', controllerTables.root)

router.get('/layout-sidenav-light', controllerLayoutSidenav.root)


router.get('/password', controllerPassword.root)

router.get('/registro', controllerRegister.root)
      .post('/registro', controllerRegister.signIn)


router.get('/error/404', controller404.root)

router.get('/error/401', controller401.root)

router.get('/error/500', controller500.root)


router.get('/control', controllerControl.root)


module.exports = router
