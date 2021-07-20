const { Router } = require('express')
const router = Router()
const controllerEval = require('../controllers/controllerEval')

router.get('/', controllerEval.index)
      .post('/', controllerEval.add)
      .get('/:key/:value', controllerEval.search, controllerEval.show)
      .put('/:key/:value', controllerEval.search, controllerEval.update)
      .delete('/:key/:value', controllerEval.search, controllerEval.destroyer)

module.exports = router
