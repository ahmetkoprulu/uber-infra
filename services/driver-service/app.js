const path = require("path");
const redis = require("redis");
const geoRedis = require("georedis");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" },
});
const { redisOptions } = require("../../helpers/consts");
const socketioJwt = require("socketio-jwt");

// Express configurations
var publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

io.use(
  socketioJwt.authorize({
    secret: "some-secret",
    handshake: true,
    auth_header_required: true,
  })
);

// Socket configurations
io.on("connection", (socket) => {
  socket.driverId = socket.handshake.query.id;

  console.log(`A driver (${socket.driverId} - ${socket.id}) connected`);

  socket.on("LFR", (driver) => {
    console.log(
      `${socket.driverId} looking for rider with socket ${socket.id} fired!`
    );

    var client = redis.createClient(redisOptions);
    var geoClient = geoRedis.initialize(client);
    client.hmset(driver.driverId, driver);
    geoClient.addLocation(driver.driverId, {
      latitude: driver.lat,
      longitude: driver.long,
    });
  });

  socket.on("NLFR", (driver) => {
    var client = redis.createClient(redisOptions);
    var geoClient = geoRedis.initialize(client);
    client.del(socket.driverId);
    geoClient.removeLocation(socket.driverId);
    console.log(`${socket.driverId} no more looking for rider.`);
  });

  socket.on("RiderFound", (tripRequest) => {
    console.log(
      `[Driver Service] ${tripRequest.driverId} found rider ${tripRequest.riderId}`
    );
  });

  socket.on("disconnect", () => {
    var client = redis.createClient(redisOptions);
    var geoClient = geoRedis.initialize(client);
    client.del(socket.driverId);
    geoClient.removeLocation(socket.driverId);

    console.log(`A driver (${socket.driverId} - ${socket.id}) disconnected`);
  });
});

console.log("[Driver Service] Starting HTTP Service...");

http.listen(3000, function () {
  console.log("[Driver Service] Listening on *:3000");
});

// var driver = {
// 	driverId (GUID),
// 	lastPingDate (DATETIME),
// 	status = (ENUM),
// 	lat = (DOUBLE),
// 	long = (DOUBLE),
// 	socketId = (STRING)
// }
