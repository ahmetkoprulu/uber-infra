var app = new Vue({
  el: "#app",
  data: {
    lat: 0,
    long: 0,
    drivers: [],
  },
  methods: {
    async addDriver() {
      var result = await axios.post(
        "http://localhost:3002/api/user/driver/login",
        {
          phoneNumber: "1",
          password: "1",
        }
      );
      console.log(result.data);
      let id = this.UUID();
      var driver = {
        driverId: id,
        lat: this.lat,
        long: this.long,
        isPinging: false,
        socket: establishConnection(id, result.data),
        matchingSocket: establishConnectionToMatchingService(id, result.data),
      };
      this.drivers.push(driver);
      this.resetInput();
    },
    toggleLookForRider(i) {
      let driver = this.drivers[i];

      if (!driver.isPinging)
        driver.pingIntervalId = pingLFR(driver.socket, driver);
      else stopPingLFR(driver.socket, driver.pingIntervalId);

      driver.isPinging = !driver.isPinging;
    },
    removeDriver(i) {
      let driver = this.drivers[i];
      try {
        driver.socket.disconnect();
      } catch {
        console.log("Socket could not be disconnected");
      }
      this.drivers.splice(i, 1);
    },
    resetInput() {
      this.lat = 0;
      this.long = 0;
    },
    UUID() {
      var rand = Math.random;
      var nbr,
        randStr = "";
      do {
        randStr += (nbr = rand()).toString(16).substr(3, 6);
      } while (randStr.length < 30);
      return (
        randStr.substr(0, 8) +
        "-" +
        randStr.substr(8, 4) +
        "-4" +
        randStr.substr(12, 3) +
        "-" +
        (((nbr * 4) | 0) + 8).toString(16) + // [89ab]
        randStr.substr(15, 3) +
        "-" +
        randStr.substr(18, 12)
      );
    },
  },
});

const establishConnection = function (driverId, token = null) {
  let soc = io.connect("", {
    query: `id=${driverId}`,
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  soc.on("connect", function () {
    console.log("Connected to the driver service", soc);
  });

  soc.on("disconnect", function () {
    console.log("Disconnected from the driver service");
  });

  return soc;
};

const establishConnectionToMatchingService = function (driverId, token = null) {
  let soc = io.connect("http://localhost:3001", {
    query: `id=${driverId}`,
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  soc.on("connect", function () {
    console.log("Connected to the matching service", soc);
  });

  soc.on("disconnect", function () {
    console.log("Disconnected from the matching service");
  });

  soc.on("RiderFound", function (riderId) {
    console.log("Rider Found");
    var decision = confirm(`${driverId} found rider ${riderId}`);
    console.log(decision);
    soc.emit("TripRequestResponse", decision);
  });
  return soc;
};

const pingLFR = function (soc, driver) {
  return setInterval(
    () =>
      soc.emit("LFR", {
        driverId: driver.driverId,
        lat: driver.lat,
        long: driver.long,
      }),
    5000
  );
};

const stopPingLFR = function (soc, intervalId) {
  clearInterval(intervalId);
  soc.emit("NLFR");
};
