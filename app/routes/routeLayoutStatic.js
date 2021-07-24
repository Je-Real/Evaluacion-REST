const { Router } = require('express')
const router = Router()
const controllerEval = require('../controllers/controllerLayaoutStatic')

router.get('/', controllerEval.root)

module.exports = router
