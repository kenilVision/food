const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  type: {
    type: String,
    enum: ["Breakfast", "Lunch", "Dinner"],
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: {
    type: String,
    enum: ["Veg", "Non-Veg"],
    required: true,
  },
  cuisine: {
    type: String,
    enum: ["North Indian", "South Indian", "Gujarati", "Punjabi", "Bengali"],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuSchema);
