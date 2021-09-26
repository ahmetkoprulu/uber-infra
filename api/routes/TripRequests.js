var express = require("express");
var router = express.Router();
var TripRequest = require("../../../models/TripRequest");
var { tripRequestState } = require("../../../helpers/consts");
const verify = require("./verifyToken");
// router.get("ping", (req, res) => {
//   res.send("I am okay");
// });

router.put("/:id", verify, (req, res) => {
  TripRequest.findByIdAndUpdate(req.params.id, {
    state: tripRequestState.accepted,
  });
});

// router.post("/", (req, res) => {
//   var post = new Post({
//     title: req.body.title,
//     description: req.body.description,
//   });
//   post.save();
//   //.then( data => { res.json(data)})
// });

module.exports = router;
