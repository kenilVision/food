const router = require('express').Router();
const {  loginDeliveryAgent , registerVendor,loginVendor, updateVendorDetails , registerUser } = require('./authorizationController');
const auth = require('../../../middlewares/auth')

router.post('/deliveryAgent/Login', loginDeliveryAgent );

router.post('/vendor/Login', loginVendor);
router.post('/vendor/Signup', registerVendor);
router.put('/vendor/updateDetail', auth, updateVendorDetails);

router.post('/user/register', auth, registerUser)
module.exports = router;