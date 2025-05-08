const User = require("../../../db/model/user");
const DeliveryAgent = require("../../../db/model/DeliveryAgent");
const Vendor = require("../../../db/model/vendor");
const Order = require("../../../db/model/order");
const Menu = require("../../../db/model/menu");

const getAvailableTables = async (req, res) => {
  try {
    const deliveryAgentId = req.user.userId;

    let vendorId;
    if (req.user.role === 'vendor') {
      vendorId = req.user.userId;
    } else {
      const deliveryAgent = await DeliveryAgent.findById(deliveryAgentId);
      if (!deliveryAgent) {
        return res
          .status(404)
          .json({ success: false, message: "Delivery agent not found!" });
      }
      vendorId = deliveryAgent.vendorId;
    }
    

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found!" });
    }

    const totalTables = vendor.totalTables;
    if (!totalTables || typeof totalTables !== "number") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vendor does not have totalTables configured.",
        });
    }

    const activeOrders = await Order.find({
      vendorId: vendor._id,
      orderStatus: { $in: ["Active", "Reserved"] },
      tableNo: { $ne: null },
    }).distinct("tableNo");

    const allTables = Array.from({ length: totalTables }, (_, i) => i + 1);

    const availableTables = allTables.filter((t) => !activeOrders.includes(t));

    return res.status(200).json({
      success: true,
      availableTables,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const assignTableToUser = async (req, res) => {
  try {
    const { userId, tableNo } = req.body;
    const deliveryAgentId = req.user.userId;

    let vendorId;
    if (req.user.role === 'vendor') {
      vendorId = req.user.userId;
    } else {
      const deliveryAgent = await DeliveryAgent.findById(deliveryAgentId);
      if (!deliveryAgent) {
        return res
          .status(404)
          .json({ success: false, message: "Delivery agent not found!" });
      }
      vendorId = deliveryAgent.vendorId;
    }
    

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res
      .status(404)
      .json({ success: false, message: "Vendor not found!" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }
    const existingOrder = await Order.findOne({
      tableNo,
      vendorId: vendor._id,
      status: { $in: ["active", "pending", "reserved"] },
    });
    if (existingOrder) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Table ${tableNo} is already in use!`,
        });
    }

    const newOrder = new Order({
      userId,
      vendorId: vendor._id,
      tableNo,
      items: [],
      totalAmount: 0,
      paymentMethod: null,
      paymentStatus: null,
    });

    await newOrder.save();

    return res.status(200).json({
      success: true,
      message: `Table ${tableNo} assigned successfully.`,
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addItemsToOrder = async (req, res) => {
  try {
    const { tableNo, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided." });
    }
    const deliveryAgentId = req.user.userId;

    let vendorId;
    if (req.user.role === 'vendor') {
      vendorId = req.user.userId;
    } else {
      const deliveryAgent = await DeliveryAgent.findById(deliveryAgentId);
      if (!deliveryAgent) {
        return res
          .status(404)
          .json({ success: false, message: "Delivery agent not found!" });
      }
      vendorId = deliveryAgent.vendorId;
    }
    

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });
    }

    const order = await Order.findOne({
      vendorId: vendor._id,
      tableNo,
      orderStatus: { $in: ["Active", "Reserved"] },
    });

    if (!order) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No active/reserved order found for this table.",
        });
    }

    let totalToAdd = 0;

    for (const incomingItem of items) {
      const menuItem = await Menu.findOne({
        _id: incomingItem.menuItemId,
        vendorId: vendor._id,
      });
      if (!menuItem) {
        return res
          .status(404)
          .json({
            success: false,
            message: `Menu item not found: ${incomingItem.menuItemId}`,
          });
      }

      const quantity = incomingItem.quantity || 1;
      const status = incomingItem.status || "Pending"; 
      const price = menuItem.price * quantity;
      const itemTotal = price * quantity;
      totalToAdd += itemTotal;

      const existingItem = order.items.find(
        (i) => i.menuItemId.toString() === incomingItem.menuItemId && i.status === status
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        order.items.push({
          menuItemId: incomingItem.menuItemId,
          quantity,
          price,
        });
      }
    }

    order.totalAmount += totalToAdd;

    if (order.orderStatus === "Reserved") {
      order.orderStatus = "Active";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Items added/updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Error adding items:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderItems = async (req, res) => {
  try {
    const { tableNo } = req.params;
    const deliveryAgentId = req.user.userId;

    let vendorId;
    if (req.user.role === 'vendor') {
      vendorId = req.user.userId;
    } else {
      const deliveryAgent = await DeliveryAgent.findById(deliveryAgentId);
      if (!deliveryAgent) {
        return res
          .status(404)
          .json({ success: false, message: "Delivery agent not found!" });
      }
      vendorId = deliveryAgent.vendorId;
    }
    

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found." });
    }

    if (!tableNo) {
      return res.status(400).json({
        success: false,
        message: "Table number is required",
      });
    }

    const order = await Order.findOne({
      tableNo,
      vendorId: vendor._id,
      orderStatus: { $in: ["Active", "Reserved"] },
    }).populate("items.menuItemId", "name description price imageUrl category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No active order found for this table",
      });
    }

    return res.status(200).json({
      success: true,
      tableNo,
      items: order.items,
      orderTotal: order.totalAmount,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Error fetching order items:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const removeOrderItem = async (req, res) => {
  try {
    const { tableNo, itemId, status } = req.body;
    if (!tableNo || !itemId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Table number, item ID, and status are required." 
      });
    }
    const deliveryAgentId = req.user.userId;

    let vendorId;
    if (req.user.role === 'vendor') {
      vendorId = req.user.userId;
    } else {
      const deliveryAgent = await DeliveryAgent.findById(deliveryAgentId);
      if (!deliveryAgent) {
        return res
          .status(404)
          .json({ success: false, message: "Delivery agent not found!" });
      }
      vendorId = deliveryAgent.vendorId;
    }
    

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found." });
    }

    const order = await Order.findOne({
      tableNo,
      vendorId: vendor._id,
      orderStatus: { $in: ["Active", "Reserved"] }
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "No active/reserved order found for this table." 
      });
    }

    const itemIndex = order.items.findIndex(item => 
      item.menuItemId.equals(itemId) && item.status === status
    );

    if (itemIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Item with specified ID and status not found in this order." 
      });
    }

    const item = order.items[itemIndex];
    const amountToDeduct = parseFloat((item.price * item.quantity).toFixed(2));

    // Remove item
    order.items.splice(itemIndex, 1);

    // Update total amount
    order.totalAmount = parseFloat((order.totalAmount - amountToDeduct).toFixed(2));

    // Optionally cancel order if no items left
    if (order.items.length === 0) {
      order.orderStatus = "Cancelled";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Item removed successfully",
      removedItem: item,
      orderTotal: order.totalAmount,
      orderStatus: order.orderStatus
    });

  } catch (error) {
    console.error("Error removing item:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};
const updateItemStatus = async (req, res) => {
  try {
    const { tableNo, menuItemId, fromStatus, status } = req.body;
    
        if (!tableNo || !menuItemId || !fromStatus || !status) {
          return res.status(400).json({
            success: false,
            message: "Missing tableNo, menuItemId, fromStatus, or status.",
          });
        }
        const deliveryAgentId = req.user.userId;

        let vendorId;
        if (req.user.role === 'vendor') {
          vendorId = req.user.userId;
        } else {
          const deliveryAgent = await DeliveryAgent.findById(deliveryAgentId);
          if (!deliveryAgent) {
            return res
              .status(404)
              .json({ success: false, message: "Delivery agent not found!" });
          }
          vendorId = deliveryAgent.vendorId;
        }
        
    
        const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found." });
    }

    // Find the order for the given table and vendor, with valid order statuses
    const order = await Order.findOne({
      vendorId: vendor._id,
      tableNo,
      orderStatus: { $in: ["Active", "Reserved"] },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found for this table." });
    }

    // Find the item with the specific menuItemId and fromStatus
    const itemIndex = order.items.findIndex(i =>
      i.menuItemId.toString() === menuItemId && i.status === fromStatus
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Item with ID ${menuItemId} and status ${fromStatus} not found in the order.`,
      });
    }

    const itemToUpdate = order.items[itemIndex];

    // Check if there's already another item with the same menuItemId and the new status
    const duplicateIndex = order.items.findIndex(i =>
      i.menuItemId.toString() === menuItemId && i.status === status
    );

    if (duplicateIndex !== -1 && duplicateIndex !== itemIndex) {
      // Merge quantities if items with the same menuItemId and status exist
      order.items[duplicateIndex].quantity += itemToUpdate.quantity;
      order.items.splice(itemIndex, 1); // Remove the old item
    } else {
      // Update the item status to the new status
      itemToUpdate.status = status;
    }

    // Save the updated order
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Item status updated successfully.",
      order,
    });

  } catch (error) {
    console.error("Error updating item status:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  assignTableToUser,
  getAvailableTables,
  addItemsToOrder,
  getOrderItems,
  removeOrderItem,
  updateItemStatus
};
