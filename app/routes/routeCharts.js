const { Router } = require('express')
const router = Router()
const controllerEval = require('../controllers/controllerCharts')

router.get('/', controllerEval.root)

module.exports = router
