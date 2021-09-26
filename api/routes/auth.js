const router = require("express").Router();
const Driver = require("../../models/Driver");
const Rider = require("../../models/Rider");

const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const driverSchema = Joi.object({
  name: Joi.string().required(),
  phoneNumber: Joi.string().min(6).required(),
});

router.post("/driver/register", async (req, res) => {
  //   const { error } = driverSchema.validate(req.body, driverSchema);
  //   if (error) return res.status(400).send(error);

  const eUser = await Driver.findOne({ phoneNumber: req.body.phoneNumber });
  if (eUser) return res.status(400).send("Phone number already Exists");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const nUser = new Driver({
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    password: hashPassword,
    drivingLicenceNumber: req.body.drivingLicenceNumber,
  });
  nUser.save();
  return res.status(200).send(nUser);
});

router.post("/driver/login", async (req, res) => {
  // TODO: Validate
  console.log("as");
  const user = await Driver.findOne({ phoneNumber: req.body.phoneNumber });
  if (!user) return res.status(400).send("phone number is wrong");

  const isPassValid = bcrypt.compare(req.body.password, user.password);
  if (!isPassValid) return res.status(400).send("password is not valid");

  const token = jwt.sign({ id: user._id }, "some-secret");
  res.send(token);
});

router.post("/rider/register", async (req, res) => {
  // TODO: Validate
  //   const { error } = driverSchema.validate(req.body, driverSchema);
  //   if (error) return res.status(400).send(error);

  const eUser = await Rider.findOne({ phoneNumber: req.body.phoneNumber });
  if (eUser) return res.status(400).send("Phone number already Exists");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const nUser = new Rider({
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    password: hashPassword,
  });
  nUser.save();
  return res.status(200).send(nUser);
});

router.post("/rider/login", async (req, res) => {
  // TODO: Validate
  const user = await Rider.findOne({ phoneNumber: req.body.phoneNumber });
  if (!user) return res.status(400).send("phone number is wrong");

  const isPassValid = bcrypt.compare(req.body.password, user.password);
  if (!isPassValid) return res.status(400).send("password is not valid");

  const token = jwt.sign({ id: user._id }, "some-secret");
  res.send(token);
});

module.exports = router;
