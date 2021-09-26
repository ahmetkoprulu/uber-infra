require("dotenv/config");
const path = require("path");
const redis = require("redis");
const geoRedis = require("georedis");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
// const http = require("http").createServer(app);
const axios = require("axios");

const server = app.listen(3001, function () {
  console.log("[Matching Service] Listening on *:3001");
});

const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

// Helpers configurations
const { TripRequestState, redisOptions } = require("../../helpers/consts");
const redisHelper = require("../../helpers/redis");

// Models configurations
const TripRequest = require("../../models/TripRequest");

// Express configurations
var publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.use(require("body-parser").json());

// Route Configurations
const tripRequestRoute = require("./routes/TripRequests");
app.use("/TripRequests", tripRequestRoute);

// Db Configurations
mongoose.connect(
  "mongodb://root:1234@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false",
  { useNewUrlParser: true, dbName: "taxi" },
  () => console.log("Connected Remote Mongo DB Cluster")
);

// Socket Configurations
io.on("connection", (socket) => {
  socket.join(socket.handshake.query.id);
  socket.riderId = socket.handshake.query.id;
  console.log(`A User is (${socket.riderId} - ${socket.id}) connected`);

  socket.on("LFD", (rider) => {
    console.log(
      `${socket.riderId} looking for driver with socket ${socket.id} fired!`
    );
    var client = redis.createClient(redisOptions);
    var geoClient = geoRedis.initialize(client);

    redisHelper.FindAvaibleDriver(geoClient, rider, async (driver) => {
      console.log(
        `[Matching Service] ${rider.riderId} found rider ${driver.key}`
      );

      socket.emit("DriverFound", driver);

      const tripRequest = new TripRequest({
        driverId: driver.key,
        riderId: rider.riderId,
        pickUpLoc: { lat: 0, long: 0 },
        dropOffLoc: { lat: 0, long: 0 },
        state: TripRequestState.sent,
        createdDate: new Date(),
      });
      tripRequest.save();
      io.to(driver.key).emit("RiderFound", rider.riderId);
      const id = (await io.in(driver.key).allSockets()).forEach((value) => {
        var soc = io.sockets.sockets.get(value);
        soc.once(
          "TripRequestResponse",
          withTimeout(
            async (response) => {
              console.log("Driver Respond", response);
              if (!response) {
                var doc = await TripRequest.findOne({ _id: tripRequest._id });
                await TripRequest.updateOne(
                  { _id: tripRequest._id },
                  {
                    state: TripRequestState.refused,
                  }
                );
                await doc.save();
                socket.emit("DriverRefused", driver);
                return;
              }
              var doc = await TripRequest.findOne({ _id: tripRequest._id });
              await TripRequest.updateOne(
                { _id: tripRequest._id },
                {
                  state: TripRequestState.accepted,
                }
              );
              await doc.save();
              socket.emit("DriverAccept", driver);
            },
            async () => {
              console.log("Driver Respond timed out!", tripRequest._id);

              var doc = await TripRequest.findOne({ _id: tripRequest._id });
              await TripRequest.updateOne(
                { _id: tripRequest._id },
                {
                  state: TripRequestState.timeout,
                }
              );
              await doc.save();
              soc.off("TripRequestResponse", () => {});
              socket.emit("DriverTimeout", driver);
            },
            5000
          )
        );
      });
    });
  });

  socket.on("TrackDriver", (driverId) => {
    return redisHelper.GetDriverLocation(driverId);
  });

  socket.on("NLFD", () => {
    clearInterval(socket.LFDInterval);
    console.log(`${socket.riderId} no more looking for driver.`);
  });

  socket.on("disconnect", () => {
    clearInterval(socket.LFDInterval);
    console.log(`A rider (${socket.riderId} - ${socket.id}) disconnected`);
  });
});

const withTimeout = (onSuccess, onTimeout, timeout) => {
  let called = false;

  const timer = setTimeout(async () => {
    if (called) return;
    called = true;
    await onTimeout();
  }, timeout);

  return (...args) => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess.apply(this, args);
  };
};

function waitUserResponse(driverId, request) {
  return new Promise(async (resolve) => {
    const handler = function (data) {
      console.log("userAnswer = ", data);
      resolve(data);
      return;
    };
    io.to(driverId).emit("RiderFound", request);
    io.to(driverId).once("TripRequestResponse", handler);
  });
}

function waitTripRequestResponse(driverId, request) {
  var promise = new Promise(async (resolve) => {
    io.to(driverId).once(
      "TripRequestResponse",
      withTimeout(
        (response) => {
          console.log("Driver Respond", response);
          resolve(response);
          return;
        },
        () => {
          console.log("Driver Respond timed out!");
          io.to(driverId).off("TripRequestResponse");
          resolve(response);
          return;
        },
        30000
      )
    );
  });
  io.to(driverId).emit("RiderFound", request);
  return promise;
}

console.log("[Matching Service] Starting HTTP Service...");
