const router = require('express').Router();
const {registerUser } = require('./userAuthController');
const auth = require('../../../../middlewares/auth')

router.post('/register', auth, registerUser)

module.exports = router;