const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access Denied");
  try {
    const verifiedUser = jwt.verify(token, "some-secret");
    req.user = verifiedUser;
  } catch {
    res.status(400).send("Invalid Token");
  }
  next();
}
