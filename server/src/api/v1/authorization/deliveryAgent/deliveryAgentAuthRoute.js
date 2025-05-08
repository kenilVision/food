const router = require('express').Router();
const {loginDeliveryAgent} = require('./deliveryAgentAuthController');

router.post('/Login', loginDeliveryAgent );

module.exports = router;