const path = require("path");
const redis = require("redis");
const geoRedis = require("georedis");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

var options = {
  withCoordinates: true, // Will provide coordinates with locations, default false
  withHashes: true, // Will provide a 52bit Geohash Integer, default false
  withDistances: true, // Will provide distance from query, default false
  order: "ASC", // or 'DESC' or true (same as 'ASC'), default false
  units: "m", // or 'km', 'mi', 'ft', default 'm'
  count: 100, // Number of results to return, default undefined
  accurate: true, // Useful if in emulated mode and accuracy is important, default false
};

var redisOptions = {
  host: "redis",
  port: 6379,
};

var publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

console.log("[Driver Service] Starting HTTP Service...");

app.get("/", function (req, res) {
  res.send("Helllloooooo");
});

app.get("/drivers", function (req, res) {
  var client = redis.createClient(redisOptions);
  var geoClient = geoRedis.initialize(client);
  geoClient.nearby(
    { latitude: req.query.lat, longitude: req.query.long },
    req.query.m,
    options,
    function (err, locations) {
      if (err) {
        console.error(err);
        return;
      }
      console.log("nearby locations as a Set:", locations.locationSet);
      res.json(locations.locationSet);
    }
  );
});

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

  socket.on("disconnect", () => {
    var client = redis.createClient(redisOptions);
    var geoClient = geoRedis.initialize(client);
    client.del(socket.driverId);
    geoClient.removeLocation(socket.driverId);

    console.log(`A driver (${socket.driverId} - ${socket.id}) disconnected`);
  });
});

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
