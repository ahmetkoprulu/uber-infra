const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

authRoute = require("./routes/auth");

app.use(express.json());
// Db Configurations
mongoose.connect(
  "mongodb://root:1234@localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false",
  { useNewUrlParser: true, dbName: "taxi" },
  () => console.log("Connected Remote Mongo DB Cluster")
);

const sleep = (t) => ({ then: (r) => setTimeout(r, t) });

let a = setInterval(() => {
  console.log("started");
  sleep(5000);
  console.log("finished");
}, 3000);

app.use("/api/user", authRoute);

app.listen(3002, () => console.log("server up and running!"));
