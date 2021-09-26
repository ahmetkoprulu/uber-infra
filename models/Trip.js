const mongoose = require("mongoose");

const tripSchema = mongoose.Schema({
  driverId: {
    type: String,
    required: true,
  },
  riderId: {
    type: String,
    required: true,
  },
  pickUpLoc: {
    type: Object,
    required: true,
  },
  dropOffLoc: {
    type: Object,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  paymentType: {
    type: Number,
    required: true,
  },
  state: {
    type: Number,
    required: true,
  },
  StartAt: {
    type: Date,
  },
  EndAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

let a = mongoose.model("Trips", tripSchema);
a.ensureIndexes();
module.exports = a;
