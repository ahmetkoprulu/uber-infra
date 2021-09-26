const mongoose = require("mongoose");

const driverSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  birthDay: {
    type: Date,
    required: false,
  },
  drivingLicenceNumber: {
    type: String,
    required: String,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

let a = mongoose.model("Drivers", driverSchema);
a.ensureIndexes();
module.exports = a;
