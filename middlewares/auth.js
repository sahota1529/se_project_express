const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const statusCodes = require("../utils/errors");

const authMiddleware = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res
        .status(statusCodes.UNAUTHORIZED_ERROR)
        .send({ message: "Authorization required" });
    }

    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;
    return next();
  } catch (err) {
    return res
      .status(statusCodes.UNAUTHORIZED_ERROR)
      .send({ message: "Authorization required" });
  }
};

module.exports = authMiddleware;
