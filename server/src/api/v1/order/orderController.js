const Order = require("../../../db/model/order");

const GenerateBillByTable = async (req, res) => {
  try {
    const { tableNo, paymentStatus } = req.body;

  
    const order = await Order.findOne({
      tableNo,
      orderStatus: { $in: ["Active", "Reserved"] },
    }).populate("items.menuItemId");

    if (!order) {
      return res.status(404).json({ success: false, message: `No active order found for table ${tableNo}` });
    }

    // Recalculate total
    let totalAmount = 0;
    order.items.forEach(item => {
      totalAmount += item.quantity * item.price;
    });

    // Update order details
    order.totalAmount = totalAmount;
    order.paymentStatus = paymentStatus || "Paid";
    order.orderStatus = "Completed";

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order for Table ${tableNo} completed successfully.`,
      bill: {
        tableNo: order.tableNo,
        orderId: order._id,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        completedAt: order.updatedAt,
      }
    });
  } catch (error) {
    console.error("Error completing order by table:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {GenerateBillByTable}