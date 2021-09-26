const mongoose = require("mongoose");

const tripRequestSchema = mongoose.Schema({
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
  state: {
    type: Number,
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
  },
});

let a = mongoose.model("TripRequests", tripRequestSchema);
a.ensureIndexes();
module.exports = a;
