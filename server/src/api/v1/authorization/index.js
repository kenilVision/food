const router = require('express').Router();

const vendor = require('./vendor/vendorAuthRoutes')
const deliveryAgent = require('./deliveryAgent/deliveryAgentAuthRoute')
const user = require('./user/userAuthRoute')

router.use('/vendor',vendor)
router.use('/deliveryAgent' , deliveryAgent )
router.use('/user', user)
module.exports = router;