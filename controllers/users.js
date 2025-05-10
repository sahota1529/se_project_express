const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  UNAUTHORIZED,
  CONFLICT,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

// GET current user
const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(new Error("Not Found"))
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);

      if (err.name === "Not Found") {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid user ID" });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// POST users
const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        const error = new Error("This email is already registered");
        error.name = "MongoError";
        error.code = 11000;
        throw error;
      }

      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({ name, avatar, email, password: hash }))
    .then((newUser) => {
      res.send({
        name: newUser.name,
        email: newUser.email,
        _id: newUser._id,
        avatar: newUser.avatar,
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      if (err.name === "MongoError" && err.code === 11000) {
        return res
          .status(CONFLICT)
          .send({ message: "This email is already registered" });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: "An error has occurred on the server" });
    });
};

// PATCH /users/me — update profile
const updateUser = (req, res) => {
  const { name, avatar } = req.body;
  const userId = req.user._id; // Retrieve the current user's ID from the auth middleware

  if (!name && !avatar) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "At least one field (name or avatar) is required" });
  }

  return User.findByIdAndUpdate(
    userId,
    { name, avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(() => {
      const error = new Error("User not found");
      error.name = "NotFoundError";
      throw error;
    })
    .then((updatedUser) =>
      res.send({ name: updatedUser.name, avatar: updatedUser.avatar })
    )
    .catch((err) => {
      console.error("Error updating user:", err);

      if (err.name === "NotFoundError") {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }

      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Validation failed", details: err.message });
      }

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid ID" });
      }

      return res
        .status(SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// POST /login
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and password are required" });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error("Authentication error:", err.message);

      if (err.message === "Incorrect email or password") {
        return res
          .status(UNAUTHORIZED)
          .send({ message: "Incorrect email or password" });
      }

      return res
        .status(SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

// Export controllers
module.exports = { getCurrentUser, createUser, login, updateUser };
