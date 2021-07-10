const { Router } = require('express')
const router = Router()
const controllerSabritas = require('../controller/controllerSabritas')

router.get('/', controllerSabritas.index)
      .post('/', controllerSabritas.add)
      .get('/:key/:value', controllerSabritas.search, controllerSabritas.show)
      .put('/:key/:value', controllerSabritas.search, controllerSabritas.update)
      .delete('/:key/:value', controllerSabritas.search, controllerSabritas.destroyer)

module.exports = router
