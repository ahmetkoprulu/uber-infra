const mongoose = require("mongoose");

const riderSchema = mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});
let a = mongoose.model("Riders", riderSchema);
a.ensureIndexes();
module.exports = a;
