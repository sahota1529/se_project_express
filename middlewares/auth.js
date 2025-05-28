const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const UnauthorizedError = require("../custom_errors/UnauthorizedError");

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    next(new UnauthorizedError("Unauthorized"));
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      next(new UnauthorizedError("Unauthorized"));
    }
    req.user = payload;
    return next();
  });

  return null;
};

module.exports = auth;
