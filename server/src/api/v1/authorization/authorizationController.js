const jwt = require("jsonwebtoken");
const DeliveryAgent = require("../../../db/model/DeliveryAgent"); 
const Vendor = require("../../../db/model/vendor");
const bcrypt = require("bcryptjs"); 
const JWT_SECRET = process.env.JWT_SECRET; 
const User = require('../../../db/model/user')

const loginDeliveryAgent = async (req, res) => {
    try {
        const { email, password } = req.body; 

        
        const deliveryAgent = await DeliveryAgent.findOne({ email });
        if (!deliveryAgent) {
            return res.status(404).json({ success: false, message: "Delivery agent not found!" });
        }

        console.log(password,deliveryAgent)
        const isMatch = await bcrypt.compare(password, deliveryAgent.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials!" });
        }
        console.log("yoo")

        
        const token = jwt.sign(
            { userId: deliveryAgent._id, email: deliveryAgent.email, role: 'deliveryAgent' },
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } 
        );

        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            deliveryAgent: {
                userId: deliveryAgent._id,
                firstname: deliveryAgent.firstname,
                lastname: deliveryAgent.lastname,
                number: deliveryAgent.number,
                email: deliveryAgent.email,
                vendorId: deliveryAgent.vendorId,
                isActive: deliveryAgent.isActive,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// const updateuserdetail = async (req , res )=>{
//     try{
//     const { firstname ,  lastname ,number , email } = req.body;
//     const userId = req.user.userId;

//     const existingCustomer = await Customer.findOne({ email, _id: { $ne: userId } });

//     if (existingCustomer) {
//         return res.status(409).json({ success: false, message: "Email already exists!" });
//     }

//     const updateCustomer = await Customer.findByIdAndUpdate(
//         userId,
//         { firstname, lastname, number, email },
//         { new: true } 
//     );

//     if (!updateCustomer) {
//         return res.status(404).json({ success: false, message: "Customer not found!" });
//     }

//     const token = jwt.sign(
//         { userId: updateCustomer._id, email: updateCustomer.email , role: 'user' },
//         JWT_SECRET,
//         { expiresIn: "1d" } // Token expires in 1 day
//     );

//     return res.status(200).json({
//         success: true,
//         message: "Successfully Updated data!",
//         token,
//         user: {
//             userId: updateCustomer._id, 
//             firstname: updateCustomer.firstname,
//             lastname:updateCustomer.lastname,
//             fullname: updateCustomer.fullname,
//             number:updateCustomer.number,
//             email: updateCustomer.email,
//             isActive: updateCustomer.isActive,
//         }
//     });

// }
// catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: error.message });
// }
// }

// const fetchuserDetail = async (req , res )=>{
//     try{

//     const userId = req.user.userId;


//     const Customerdetail = await Customer.findById(userId);

//     if (!Customerdetail) {
//         return res.status(404).json({ success: false, message: "Customer not found!" });
//     }

//     const token = jwt.sign(
//         { userId: Customerdetail._id, email: Customerdetail.email ,role: 'user' },
//         JWT_SECRET,
//         { expiresIn: "1d" } 
//     );

//     return res.status(200).json({
//         success: true,
//         message: "Successfully Updated data!",
//         token,
//         customer: {
//             userId: Customerdetail._id, 
//             firstname: Customerdetail.firstname,
//             lastname:Customerdetail.lastname,
//             fullname: Customerdetail.fullname,
//             number:Customerdetail.number,
//             email: Customerdetail.email,
//             isActive: Customerdetail.isActive,
//         }
//     });

// }
// catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: error.message });
// }
// }

const registerVendor = async (req, res) => {
    try {
        const { firstname, lastname, number, email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required!" });
        }

        const isEmailExists = await Vendor.findOne({ email });
        if (isEmailExists) {
            return res.status(409).json({ success: false, message: "Email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newVendor = await Vendor.create({
            firstname,
            lastname,
            number,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { userId: newVendor._id, email: newVendor.email, role: 'vendor' },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Vendor registered successfully!",
            token,
            vendor: {
                userId: newVendor._id,
                firstname: newVendor.firstname,
                lastname: newVendor.lastname,
                fullname: newVendor.fullname,
                number: newVendor.number,
                email: newVendor.email,
                isActive: newVendor.isActive
            },
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required!" });
        }

        const vendor = await Vendor.findOne({ email }).select("+password");

        if (!vendor) {
            return res.status(401).json({ success: false, message: "Email or password invalid!" });
        }

        const isPasswordMatch = await bcrypt.compare(password, vendor.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Email or password invalid!" });
        }

        if (!vendor.isActive) {
            return res.status(403).json({ success: false, message: "Your account is inactive!" });
        }

        const token = jwt.sign(
            { userId: vendor._id, email: vendor.email , role: 'vendor' },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Vendor login successful!",
            token,
            vendor: {
                userId: vendor._id,
                firstname: vendor.firstname,
                lastname: vendor.lastname,
                fullname: vendor.fullname,
                number: vendor.number,
                email: vendor.email,
                isActive: vendor.isActive,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


const updateVendorDetails = async (req, res) => {
    try {
        const { firstname, lastname, number, email , totalTables} = req.body;
        const userId = req.user.userId;


        const existingVendor = await Vendor.findOne({ email, _id: { $ne: userId } });
        if (existingVendor) {
            return res.status(409).json({ success: false, message: "Email already exists!" });
        }

        const updateData = { firstname, lastname, number, email, totalTables }; 

        const updatedVendor = await Vendor.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!updatedVendor) {
            return res.status(404).json({ success: false, message: "Vendor not found!" });
        }

        const token = jwt.sign(
            { userId: updatedVendor._id, email: updatedVendor.email, role: 'vendor' },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Vendor updated successfully!",
            token,
            vendor: {
                userId: updatedVendor._id,
                firstname: updatedVendor.firstname,
                lastname: updatedVendor.lastname,
                fullname: updatedVendor.fullname,
                number: updatedVendor.number,
                email: updatedVendor.email,
                totalTables: updatedVendor.totalTables, 
                isActive: updatedVendor.isActive,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


// const fetchVendorDetail = async (req , res )=>{
//     try{

//     const userId = req.user.userId;


//     const Vendordetail = await Vendor.findById(userId);

//     if (!Vendordetail) {
//         return res.status(404).json({ success: false, message: "Customer not found!" });
//     }

//     const token = jwt.sign(
//         { userId: Vendordetail._id, email: Vendordetail.email },
//         JWT_SECRET,
//         { expiresIn: "1d" } 
//     );

//     return res.status(200).json({
//         success: true,
//         message: "Successfully Updated data!",
//         token,
//         customer: {
//             userId: Vendordetail._id, 
//             firstname: Vendordetail.firstname,
//             lastname:Vendordetail.lastname,
//             fullname: Vendordetail.fullname,
//             number:Customerdetail.number,
//             email: Customerdetail.email,
//             isActive: Customerdetail.isActive,
//         }
//     });

// }
// catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: error.message });
// }
// }


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

      } else if (role === "deliveryAgent") {

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

module.exports = {  loginDeliveryAgent , registerVendor,loginVendor, updateVendorDetails , registerUser  };