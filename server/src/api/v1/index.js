const router = require('express').Router();

const auth = require('./authorization');
const menu =  require('./menu/menuRoute')
const order =  require('./order/orderRoutes')
const vendor = require('./Vendor/vendorRoute')
const deliveryAgent = require('./deliveryAgent/deliveryAgentRoute')
const analytic = require('./analytic/analyticRoute')

router.use('/auth', auth);
router.use('/menu', menu);
router.use('/order',order);
router.use('/vendor',vendor)
router.use('/deliveryagent' , deliveryAgent )
router.use('/alaystic', analytic)
module.exports = router;