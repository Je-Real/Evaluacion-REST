const { Router } = require('express')
const router = Router()

const controllerTest = require('../controllers/test/controllerTest')


router.get('/testing', controllerTest.root)


module.exports = router
