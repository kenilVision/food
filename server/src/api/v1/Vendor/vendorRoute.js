const express = require('express');
const router = express.Router();
const { 
  assignTableToDeliveryAgent, 
  createMenuItem ,
  registerDeliveryAgent
} = require('./vendorController');
const auth = require('../../../middlewares/vendorAuth');



const multer  = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    folder= path.join(__dirname,'../../../public/item')
    cb(null, folder); 
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now() + Math.floor(Math.random() * 10000)}${path.extname(file.originalname)}`); 
  }
});

const upload = multer({ storage: storage });


router.post('/deliveryAgent/Signup', auth, registerDeliveryAgent );
router.post('/assignTable', auth, assignTableToDeliveryAgent);
router.post('/createMenuItem', auth, upload.single('image'), createMenuItem);

module.exports = router;
