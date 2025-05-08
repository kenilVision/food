const Vendor = require("../../../db/model/vendor");
const Menu = require("../../../db/model/menu");
const mongoose = require('mongoose');


const getVendors = async (req, res) => {
    try {

        const { category, cuisine, priceSort } = req.body;
        
        const sortDirection = priceSort === -1 ? -1 : 1;

        const menuFilter = {};
        if (category?.length) menuFilter["category"] = { $in: Array.isArray(category) ? category : [category] };

        if (cuisine?.length) menuFilter["cuisine"] = { $in: Array.isArray(cuisine) ? cuisine : [cuisine] };

         const pipeline = [
            {
                $lookup: {
                    from: "menus",
                    let: { vendorId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$vendorId", "$$vendorId"] },
                                ...(Object.keys(menuFilter).length ? menuFilter : {})
                            }
                        },
                        ...(priceSort !== undefined ? [{ $sort: { price: sortDirection } }] : [])
                    ],
                    as: "sortedMenu"
                }
            },
            {
                $addFields: {
                    menu: "$sortedMenu" // Replace with sorted results
                }
            },
            {
                $project: {
                    sortedMenu: 0 // Remove temporary field
                }
            },
            {
                $match: {
                    "menu.0": { $exists: true } // Only vendors with matching items
                }
            }
        ];

        const vendors = await Vendor.aggregate(pipeline);
      
          return res.status(200).json({
            success: true,
            message: "All vendors with their menus retrieved successfully",
            vendors
          });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getVendorsbyid = async (req, res) => {
    try {
        const vendorId = req.params.id;

        // Get vendor by ID excluding the menu items
        const vendorWithMenu = await Vendor.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(vendorId)
              }
            },
            {
              $lookup: {
                from: "menus",         // Collection name for menu items
                localField: "_id",
                foreignField: "vendorId",
                as: "menu"
              }
            }
          ]);

        return res.status(200).json({
            success: true,
            message: "Vendor details retrieved successfully!",
            vendors: vendorWithMenu,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};



const getVendorsMealbyid = async (req, res) => {
    try {
        const { vendorId, type } = req.body;

       
        const menuItems = await Menu.find({ vendorId });

        if (!menuItems) {
            return res.status(404).json({ success: false, message: "Menu items not found!" });
        }

        let filteredMenu = menuItems;

        
        if (type) {
            filteredMenu = menuItems.filter(item => item.type === type);
        }

        return res.status(200).json({
            success: true,
            message: "Vendor menu details retrieved successfully!",
            menu: filteredMenu, 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {  getVendors , getVendorsbyid ,getVendorsMealbyid };
