const mongoose = require('mongoose');


const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["Pending", "Preparing", "Served"],
    default: "Pending"
  }
}, { _id: false });


const orderSchema = new mongoose.Schema(
  {
    tableNo: { type: Number, required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: ["Active", "Completed", "Cancelled", "Reserved"],
      default: "Active",  
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Order", orderSchema);