const router = require('express').Router();
const { billdata , dailySales , topDish , tableUsage , orderStatus} = require('./analyticController');
const auth = require('../../../middlewares/vendorAuth')

router.get('/billdata',auth, billdata);
router.get('/dailySales', auth , dailySales)
router.get('/topDish', auth , topDish)
router.get('/tableUsage', auth , tableUsage)
router.get('/orderStatus', auth , orderStatus)
module.exports = router;