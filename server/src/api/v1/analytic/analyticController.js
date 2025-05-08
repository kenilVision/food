const Order = require("../../../db/model/order");
const Menu = require("../../../db/model/menu");
const mongoose = require("mongoose");
  const billdata = async (req, res) => {
    try {
      const VendorId = req.user.userId;


      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
  
    
      // start.setHours(0, 0, 0, 0);
      // end.setHours(23, 59, 59, 999);
  
      const result = await Order.aggregate([
        {
          $match: {
            vendorId: new mongoose.Types.ObjectId(VendorId),  
            paymentStatus: "Paid",  
            createdAt: { $gte: start, $lte: end }  
          }
        },
        {
          $group: {
            _id: null, 
            totalOrders: { $sum: 1 },  
            totalRevenue: { $sum: "$totalAmount" } 
          }
        },
        {
          $project: {
            _id: 0,  
            totalOrders: 1,
            totalRevenue: 1,
            averageBillValue: {
              $cond: [
                { $gt: ["$totalOrders", 0] }, 
                { $divide: ["$totalRevenue", "$totalOrders"] },  
                0  
              ]
            }
          }
        }
      ]);

      return res.status(200).json({
        success: true,
        totalOrders: result[0]?.totalOrders || 0,  
        totalRevenue: result[0]?.totalRevenue || 0,  
        averageBillValue: result[0]?.averageBillValue || 0  
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  const dailySales = async (req, res) => {
    try {
        const VendorId = req.user.userId;
    
    
        const { startDate, endDate } = req.query;
    
        const start = startDate ? new Date(startDate) : new Date();
        const end = endDate ? new Date(endDate) : new Date();
    

 
    const salesData = await Order.aggregate([
      
      {
        $match: {
          vendorId: new mongoose.Types.ObjectId(VendorId),
          paymentStatus: "Paid",
          createdAt: { $gte: start, $lte: end }  
        }
      },
   
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" } 
        }
      },
     
      {
        $sort: { _id: 1 } 
      },
      {
        $project: {
          date: "$_id", 
          totalSales: 1, 
          _id: 0
        }
      }
    ]);

   
    return res.status(200).json({
      success: true,
      dailySales: salesData 
    });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  const topDish = async (req, res) => {
    try {
      const VendorId = req.user.userId;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
  
      const topDishes = await Order.aggregate([
        {
          $match: {
            vendorId: new mongoose.Types.ObjectId(VendorId),
            paymentStatus: "Paid",
            createdAt: { $gte: start, $lte: end }  
          },
        },
        {
          $unwind: "$items", 
        },
        {
          $group: {
            _id: "$items.menuItemId", 
            totalSold: { $sum: "$items.quantity" },
          },
        },
        {
          $lookup: {
            from: "menus", 
            localField: "_id",
            foreignField: "_id",
            as: "dishDetails",
          },
        },
        {
          $unwind: "$dishDetails", 
        },
        {
          $project: {
            _id: 0, 
            dishId: "$_id", 
            name: "$dishDetails.name", 
            totalSold: 1, 
          },
        },
        {
          $sort: { totalSold: -1 }, 
        },
      ]);
  
      return res.status(200).json({
        success: true,
        topDishes,
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  const tableUsage = async (req, res) => {
    try {
      const VendorId = new mongoose.Types.ObjectId(req.user.userId);
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
  
  

      const usage = await Order.aggregate([
        {
          $match: {
            vendorId: new mongoose.Types.ObjectId(VendorId),
            paymentStatus: "Paid",
            createdAt: { $gte: start, $lte: end }  
          },
        },
        {
          $group: {
            _id: "$tableNo", 
            usageCount: { $sum: 1 }, 
          },
        },
        {
          $project: {
            _id: 0, 
            tableNo: "$_id", 
            usageCount: 1, 
          },
        },
        {
          $sort: { usageCount: -1 }, 
        },
      ]);
  
      return res.status(200).json({
        success: true,
        tableUsage: usage,
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  const orderStatus = async (req, res) => {
    try {
      const VendorId = new mongoose.Types.ObjectId(req.user.userId);
        
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const orders = await Order.aggregate([
        {
          $match: {
            vendorId: VendorId,
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 }
          }
        }
      ]);


      const statusCounts = {
        Active: 0,
        Completed: 0,
        Cancelled: 0,
        Reserved: 0
      };
  
  
      orders.forEach(({ _id, count }) => {
        if (statusCounts.hasOwnProperty(_id)) {
          statusCounts[_id] = count;
        }
      });


      return res.status(200).json({
        success: true,
        orderStatus: statusCounts
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };

module.exports = {
    billdata,
    dailySales,
    topDish,
    tableUsage,
    orderStatus
};
