var app = new Vue({
  el: "#app",
  data: {
    lat: 0,
    long: 0,
    riders: [],
  },
  methods: {
    async addRider() {
      var result = await axios.post(
        "http://localhost:3002/api/user/driver/login",
        {
          phoneNumber: "1",
          password: "1",
        }
      );
      console.log(result.data);
      let id = this.UUID();
      var rider = {
        riderId: id,
        lat: this.lat,
        long: this.long,
        isPinging: false,
        socket: establishConnection(id, result.data),
      };
      this.riders.push(rider);
      this.resetInput();
    },
    toggleLookForRider(i) {
      let rider = this.riders[i];

      if (!rider.isPinging) rider.pingIntervalId = pingLFD(rider.socket, rider);
      else stopPingLFD(rider.socket, rider.pingIntervalId);

      rider.isPinging = !rider.isPinging;
    },
    removeRider(i) {
      let rider = this.riders[i];
      try {
        rider.socket.disconnect();
      } catch {
        console.log("Socket could not be disconnected");
      }
      this.riders.splice(i, 1);
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

const establishConnection = function (riderId, token = null) {
  let soc = io.connect("", {
    query: `id=${riderId}`,
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

  return soc;
};

const pingLFD = function (soc, rider) {
  soc.emit("LFD", {
    riderId: rider.riderId,
    lat: rider.lat,
    long: rider.long,
  });
};

const stopPingLFD = function (soc) {
  soc.emit("NLFD");
};
