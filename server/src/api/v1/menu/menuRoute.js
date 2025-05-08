const router = require('express').Router();
const auth = require('../../../middlewares/auth');
const { getVendors , getVendorsbyid , getVendorsMealbyid} = require('./menuController'); 

router.post('/getVendors',  auth, getVendors);
router.get('/getVendor/:id', auth, getVendorsbyid);
router.post('/getVendorMeals', auth, getVendorsMealbyid);
module.exports = router;