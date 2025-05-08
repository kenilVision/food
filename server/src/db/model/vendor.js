const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  fullname: { type: String },
  number: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  totalTables: { type: Number, default : null },
  password: { type: String, required: true, select: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

vendorSchema.pre("save", function (next) {
  this.fullname = `${this.firstname} ${this.lastname}`;
  next();
});

vendorSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.firstname || update.lastname) {
    const doc = await this.model.findOne(this.getQuery());
    update.fullname = `${update.firstname || doc.firstname} ${update.lastname || doc.lastname}`;
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model("Vendor", vendorSchema);
