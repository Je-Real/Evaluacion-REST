const { Router } = require('express')
const router = Router()

const controllerIndex = require('../controllers/controllerInicio')
const controllerLayoutStatic = require('../controllers/controllerLayoutStatic')
const controllerTables = require('../controllers/controllerTables')
const controllerLayoutSidenav = require('../controllers/controllerLayoutSidenav')
const controllerReporteC = require('../controllers/controllerReporteC')

const controller404 = require('../controllers/error/controller404')
const controller401 = require('../controllers/error/controller401')
const controller500 = require('../controllers/error/controller500')

const controllerLogin = require('../controllers/session/controllerLogin')
const controllerPassword = require('../controllers/session/controllerPassword')
const controllerRegister = require('../controllers/session/controllerRegister')

const controllerControl = require('../controllers/secret/controllerControl')


router.get('/inicio', controllerIndex.root)
      .get('/inicio/test', controllerIndex.test)
      
router.get('/reporte', controllerReporteC.root)
      .post('/reporte/add', controllerReporteC.add)
      .get('/reporte/get', controllerReporteC.get)

router.get('/layout-static', controllerLayoutStatic.root)
      
router.get('/tables', controllerTables.root)
      
router.get('/layout-sidenav-light', controllerLayoutSidenav.root)
      
      
router.get('/password', controllerPassword.root)
      
router.get('/sesion/nuevo-usuario', controllerRegister.root)
      .post('/sesion/nuevo-usuario', controllerRegister.signIn)
      .post('/sesion/login', controllerLogin.logIn)
      .get('/sesion/logout', controllerLogin.logOut)


router.get('/error/404', controller404.root)

router.get('/error/401', controller401.root)

router.get('/error/500', controller500.root)


router.get('/control', controllerControl.root)


module.exports = router
