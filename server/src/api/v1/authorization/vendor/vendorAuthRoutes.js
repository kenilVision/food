const router = require('express').Router();
const { registerVendor,loginVendor, updateVendorDetails } = require('./vendorAuthController');
const auth = require('../../../../middlewares/vendorAuth')


router.post('/Login', loginVendor);
router.post('/Signup', registerVendor);
router.put('/updateDetail', auth, updateVendorDetails);

module.exports = router;