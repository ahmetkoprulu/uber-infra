const { nearByDriverOptions } = require("./consts");
const redis = require("redis");
const geoRedis = require("georedis");

function FindAvaibleDriver(redis, rider, callback) {
  redis.nearby(
    { latitude: rider.lat, longitude: rider.long },
    1000,
    nearByDriverOptions,
    function (err, locations) {
      if (err) {
        console.error(err);
        return false;
      }
      console.log("nearby locations as a Set:", locations.locationSet);
      if (locations.length == 0) return false;
      console.log(locations[0]);
      let driver = locations[0];
      callback(driver);
    }
  );
}

function GetDriverLocation(driverId) {
  var client = redis.createClient(redisOptions);
  var geoClient = geoRedis.initialize(client);
  return geoClient.location(driver, (err, location) => {
    if (err) return null;
    return { lat: location.latitude, long: location.longitude };
  });
}

module.exports = { FindAvaibleDriver, GetDriverLocation };
