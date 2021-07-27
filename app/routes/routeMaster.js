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

//const controllerEx = require('../controllers/Ex')

router.get('/', controllerIndex.root)
      .get('/:key/:value', controllerIndex.search, controllerIndex.show)

router.get('/charts/', controllerCharts.root)

router.get('/layout-static/', controllerLayoutStatic.root)

router.get('/tables/', controllerTables.root)

router.get('/layout-sidenav-light/', controllerLayoutSidenav.root)


router.get('/session/login/', controllerLogin.root)

router.get('/session/pass/', controllerPassword.root)

router.get('/session/signin/', controllerRegister.root)


router.get('/error/404/', controller404.root)

router.get('/error/401/', controller401.root)

router.get('/error/500/', controller500.root)


//router.get('/Ex', controllerEx.root)

module.exports = router
