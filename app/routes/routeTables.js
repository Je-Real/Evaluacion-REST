const { Router } = require('express')
const router = Router()
const controllerEval = require('../controllers/controllerTables')

router.get('/', controllerEval.root)

module.exports = router
