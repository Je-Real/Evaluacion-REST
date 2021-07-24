const { Router } = require('express')
const router = Router()
const controllerEval = require('../controllers/controllerIndex')

router.get('/', controllerEval.root)
      .get('/:key/:value', controllerEval.search, controllerEval.show)

module.exports = router
