const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
    },
    number: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    table: {
        type: Number,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    vendorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Vendor", 
    },
}, { timestamps: true });

userSchema.pre("save", function (next) {
    this.fullname = `${this.firstname} ${this.lastname}`;
    next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    if (update.firstname || update.lastname) {
        const docToUpdate = await this.model.findOne(this.getQuery());

        const newFirstname = update.firstname || docToUpdate.firstname;
        const newLastname = update.lastname || docToUpdate.lastname;
        update.fullname = `${newFirstname} ${newLastname}`;

        this.setUpdate(update);
    }

    next();
});

module.exports = mongoose.model("User", userSchema);
