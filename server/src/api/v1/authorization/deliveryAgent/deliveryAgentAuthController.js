const jwt = require("jsonwebtoken");
const DeliveryAgent = require("../../../../db/model/DeliveryAgent"); 
const bcrypt = require("bcryptjs"); 
const JWT_SECRET = process.env.JWT_SECRET; 

const loginDeliveryAgent = async (req, res) => {
    try {
        const { email, password } = req.body; 

        
        const deliveryAgent = await DeliveryAgent.findOne({ email });
        if (!deliveryAgent) {
            return res.status(404).json({ success: false, message: "Delivery agent not found!" });
        }

        const isMatch = await bcrypt.compare(password, deliveryAgent.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials!" });
        }

        
        const token = jwt.sign(
            { userId: deliveryAgent._id, email: deliveryAgent.email, role: 'deliveryAgent' },
            JWT_SECRET, 
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


module.exports = {  loginDeliveryAgent };