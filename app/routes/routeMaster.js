const { Router } = require('express')
const router = Router()

const controllerIndex = require('../controllers/controllerInicio')
const controllerLayoutStatic = require('../controllers/controllerEncuesta')
const controllerControl = require('../controllers/controllerControl')
const controllerReporteC = require('../controllers/controllerReporte')

const controller404 = require('../controllers/error/controller404')
const controller401 = require('../controllers/error/controller401')
const controller500 = require('../controllers/error/controller500')

const controllerLogin = require('../controllers/session/controllerLogin')
const controllerPassword = require('../controllers/session/controllerPassword')
const controllerRegister = require('../controllers/session/controllerRegister')

//const controllerControl = require('../controllers/secret/controllerControl')


router.get('/inicio', controllerIndex.root)
      .get('/inicio/test', controllerIndex.test)
      
router.get('/reportes', controllerReporteC.root)
      .post('/reportes/get', controllerReporteC.get)

router.get('/encuesta', controllerLayoutStatic.root)
      .post('/encuesta', controllerLayoutStatic.post)
      
router.get('/control', controllerControl.root)
      .get('/control/get', controllerControl.get)

router.get('/registro', controllerRegister.root)

      
router.get('/password', controllerPassword.root)
      
router.post('/sesion/nuevo-usuario', controllerRegister.signIn)
      .post('/sesion/login', controllerLogin.logIn)
      .get('/sesion/logout', controllerLogin.logOut)


router.get('/error/401', controller401.root)
      
router.get('/error/404', controller404.root)

router.get('/error/500', controller500.root)


router.get('/control', controllerControl.root)


module.exports = router
