const User = require("../models/user");
const statusCodes = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(statusCodes.OK).send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Input is incorrect" });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => res.status(statusCodes.CREATED).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res
          .status(statusCodes.INVALID_DATA_ERROR)
          .send({ message: "user creation unsuccesful" });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "user creation unsuccesful" });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail()
    .then((user) => {
      res.status(statusCodes.OK).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(statusCodes.NOT_FOUND_ERROR)
          .send({ message: "Incorrect user Id" });
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

module.exports = { getUsers, createUser, getUser };
