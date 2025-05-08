const DeliveryAgent = require('../../../db/model/DeliveryAgent'); 
const Menu = require("../../../db/model/menu");
const jwt = require("jsonwebtoken");
const Vendor = require("../../../db/model/vendor");
const bcrypt = require("bcryptjs"); 


const assignTableToDeliveryAgent = async (req, res) => {
    try {
        const { deliveryAgentId, tableNo } = req.body; 
        const vendorId = req.user.userId; 
        

        const deliveryAgent = await DeliveryAgent.findById(deliveryAgentId);
        if (!deliveryAgent) {
            return res.status(404).json({ success: false, message: "Delivery agent not found!" });
        }

      
        if (deliveryAgent.vendorId.toString() !== vendorId) {
            return res.status(403).json({ success: false, message: "You are not authorized to assign a table to this delivery agent!" });
        }

     
        deliveryAgent.assignedTable = tableNo;

      
        const updatedDeliveryAgent = await deliveryAgent.save();

        return res.status(200).json({
            success: true,
            message: "Table assigned successfully!",
            deliveryAgent: {
                userId: updatedDeliveryAgent._id,
                firstname: updatedDeliveryAgent.firstname,
                lastname: updatedDeliveryAgent.lastname,
                number: updatedDeliveryAgent.number,
                email: updatedDeliveryAgent.email,
                vendorId: updatedDeliveryAgent.vendorId,
                assignedTable: updatedDeliveryAgent.assignedTable,
                isActive: updatedDeliveryAgent.isActive,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};



const registerDeliveryAgent = async (req, res) => {
    try {
        const { firstname, lastname, number, email, password } = req.body;
        const userId = req.user.userId; 


        const existingAgent = await DeliveryAgent.findOne({ email });
        if (existingAgent) {
            return res.status(409).json({ success: false, message: "Email already exists for another delivery agent!" });
        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const newDeliveryAgent = new DeliveryAgent({
            firstname,
            lastname,
            number,
            email,
            password: hashedPassword,
            vendorId: userId,
        });

       
        const savedAgent = await newDeliveryAgent.save();

       
        const token = jwt.sign(
            { userId: savedAgent._id, email: savedAgent.email, role: 'deliveryAgent' },
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            success: true,
            message: "Delivery agent registered successfully!",
            token,
            deliveryAgent: {
                userId: savedAgent._id,
                firstname: savedAgent.firstname,
                lastname: savedAgent.lastname,
                number: savedAgent.number,
                email: savedAgent.email,
                vendorId: savedAgent.vendorId,
                isActive: savedAgent.isActive,
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


const createMenuItem = async (req, res) => {
    try {

        const vendorId = req.user.userId;
        const { type, name, price, category, cuisine } = req.body;
    

        const imageUrl = `/item/${req.file.filename}`;

        const newMenuItem = new Menu({
            vendorId,
            type,
            name,
            price,
            category,
            cuisine,
            image: imageUrl,
        });

        await newMenuItem.save();

        return res.status(201).json({
            success: true,
            message: "Menu item added successfully!",
            menuItem: newMenuItem, 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {createMenuItem , assignTableToDeliveryAgent , registerDeliveryAgent}