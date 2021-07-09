const { Router } = require('express')
const router = Router()
const controllerVinos = require('../controller/controllerVinos')

router.get('/', controllerVinos.index)
      .post('/', controllerVinos.add)
      .get('/:key/:value', controllerVinos.search, controllerVinos.show)
      .put('/:key/:value', controllerVinos.search, controllerVinos.update)
      .delete('/:key/:value', controllerVinos.search, controllerVinos.destroyer)

module.exports = router
