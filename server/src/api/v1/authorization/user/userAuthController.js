const jwt = require("jsonwebtoken");
const DeliveryAgent = require("../../../../db/model/DeliveryAgent"); 
const Vendor = require("../../../../db/model/vendor");
const JWT_SECRET = process.env.JWT_SECRET; 
const User = require('../../../../db/model/user')


const registerUser = async (req, res) => {
    try {
      const { firstname, lastname, email, number } = req.body;
      const role = req.user.role; 
      const userId = req.user.userId; 
  
      
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: "User already exists!" });
      }
  
      let vendorId = null;
  
      if (role === "vendor") {  
        const vendor = await Vendor.findById(userId);
        if (!vendor) return res.status(400).json({ success: false, message: "Vendor not found!" });
        vendorId = vendor._id;
      } 
      else if (role === "deliveryAgent") {
        const deliveryAgent = await DeliveryAgent.findById(userId);
        if (!deliveryAgent || !deliveryAgent.vendorId) {
          return res.status(400).json({ success: false, message: "Delivery agent or associated vendor not found!" });
        }
        vendorId = deliveryAgent.vendorId;
      } else {
        return res.status(403).json({ success: false, message: "Unauthorized role" });
      }
  
      
      const newUser = new User({
        firstname,
        lastname,
        email,
        number,
        vendorId,
      });
  
      await newUser.save();
  
      const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: "1d" });
  
      return res.status(201).json({
        success: true,
        message: `User registered successfully by ${role}`,
        token,
        user: {
          userId: newUser._id,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          email: newUser.email,
          number: newUser.number,
        },
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

module.exports = { registerUser  };