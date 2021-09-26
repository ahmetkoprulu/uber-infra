export const establishConnection = function (driverId) {
  let soc = io.connect("", { query: `id=${driverId}` });

  soc.on("connect", function () {
    console.log("Connected to the driver service", soc);
  });

  soc.on("disconnect", function () {
    console.log("Disconnected from the driver service");
  });

  return soc;
};

export const pingLFR = function (soc, driver) {
  return setInterval(() => soc.emit("LFR", driver), 3000);
};

export const stopPingLFR = function (soc, intervalId) {
  clearInterval(intervalId);
  soc.emit("NLFR");
};

// {
//     driverId: "8a1624fb-424a-4e71-b170-fd89aaae44d5",
//     lastPingDate: Date.now(),
//     lat: 41.00677,
//     long: 29.045981,
//     socketId: soc.id,
//   }
