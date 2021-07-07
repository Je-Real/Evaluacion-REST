const { Router } = require('express')
const router = Router()
const controllerDulces = require('../controller/controllerDulces')

router.get('/', controllerDulces.index)
      .post('/', controllerDulces.add)
      .get('/:key/:value', controllerDulces.search, controllerDulces.show)
      .put('/:key/:value', controllerDulces.search, controllerDulces.update)
      .delete('/:key/:value', controllerDulces.search, controllerDulces.destroyer)

module.exports = router
