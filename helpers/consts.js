require("dotenv/config");

// Enums
const TripRequestState = {
  unknown: 0,
  sent: 1,
  accepted: 2,
  refused: 3,
  timeout: 4,
};

// Redis Configurations
const nearByDriverOptions = {
  withCoordinates: true, // Will provide coordinates with locations, default false
  withHashes: true, // Will provide a 52bit Geohash Integer, default false
  withDistances: true, // Will provide distance from query, default false
  order: "ASC", // or 'DESC' or true (same as 'ASC'), default false
  units: "m", // or 'km', 'mi', 'ft', default 'm'
  count: 100, // Number of results to return, default undefined
  accurate: true, // Useful if in emulated mode and accuracy is important, default false
};

const redisOptions = {
  host:
    process.env.NODE_ENV === "production" ? process.env.REDIS_CS : "localhost",
  port: 6379,
};

module.exports = { TripRequestState, redisOptions, nearByDriverOptions };
