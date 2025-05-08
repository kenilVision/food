const mongoose = require("mongoose");

const deliveryAgentSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  fullname: { type: String },
  number: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }, 
  assignedTable: { type: Number, required: false } 
}, { timestamps: true });

deliveryAgentSchema.pre("save", function (next) {
  this.fullname = `${this.firstname} ${this.lastname}`;
  next();
});

deliveryAgentSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    if (update.firstname || update.lastname) {
      const doc = await this.model.findOne(this.getQuery());
      update.fullname = `${update.firstname || doc.firstname} ${update.lastname || doc.lastname}`;
      this.setUpdate(update);
    }
    next();
  });

module.exports = mongoose.model("DeliveryAgent", deliveryAgentSchema);
