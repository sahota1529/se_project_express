const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const statusCodes = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(statusCodes.INVALID_DATA_ERROR)
      .send({ message: "Email and password are required" });
  }

  return User.findUserByCredentials(email, password)

    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(statusCodes.OK).send({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        return res
          .status(statusCodes.UNAUTHORIZED_ERROR)
          .send({ message: "Incorrect password or email" });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Something went wrong, please try again later" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    res
      .status(statusCodes.INVALID_DATA_ERROR)
      .send({ message: "The email and password fields are requried" });
    return;
  }

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return res.status(statusCodes.CREATED).send(userObj);
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 11000) {
        return res
          .status(statusCodes.CONFLICT_ERROR)
          .send({ message: "Email already exists" });
      }
      if (err.name === "ValidationError") {
        return res
          .status(statusCodes.INVALID_DATA_ERROR)
          .send({ message: "Invalid input" });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "user creation unsuccesful" });
    });
};

const getCurrentUser = (req, res) => {
  const { _id } = req.user;

  User.findById(_id)
    .orFail()
    .then((user) => {
      res.status(statusCodes.OK).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(statusCodes.NOT_FOUND_ERROR)
          .send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res
          .status(statusCodes.INVALID_DATA_ERROR)
          .send({ message: "Incorrect user Id" });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Incorrect user Id" });
    });
};

const updateUser = (req, res) => {
  const { name, avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((user) => {
      res.status(statusCodes.OK).send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res
          .status(statusCodes.INVALID_DATA_ERROR)
          .send({ message: "Invalid entry" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(statusCodes.NOT_FOUND_ERROR)
          .send({ message: "Not found" });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Not found" });
    });
};

module.exports = { createUser, getCurrentUser, login, updateUser };
