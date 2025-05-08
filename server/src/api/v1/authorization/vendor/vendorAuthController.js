const jwt = require("jsonwebtoken");
const Vendor = require("../../../../db/model/vendor");
const bcrypt = require("bcryptjs"); 
const JWT_SECRET = process.env.JWT_SECRET; 



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

module.exports = { registerVendor,loginVendor, updateVendorDetails };