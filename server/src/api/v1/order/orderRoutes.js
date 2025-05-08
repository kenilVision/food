const router = require('express').Router();
const {GenerateBillByTable} = require('./orderController');
const auth = require('../../../middlewares/auth')

router.post('/GenerateBillByTable',auth, GenerateBillByTable );

module.exports = router;