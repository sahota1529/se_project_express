const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const BadRequestError = require("../custom_errors/BadRequestError");
const ConflictError = require("../custom_errors/ConflictError");
const NotFoundError = require("../custom_errors/NotFoundError");
const UnauthorizedError = require("../custom_errors/UnauthorizedError");
const { JWT_SECRET } = require("../utils/config");

// GET current user
const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(new Error("Not Found"))
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "Not Found") {
        next(new NotFoundError("Not Found"));
      }
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid user ID"));
      } else {
        next(err);
      }
    });
};

// POST users
const createUser = (req, res, next) => {
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
        next(new BadRequestError("Invalid data provided"));
      }
      if (err.name === "MongoError" && err.code === 11000) {
        next(new ConflictError("This email is already registered"));
      } else {
        next(err);
      }
    });
};

// PATCH /users/me — update profile
const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;
  const userId = req.user._id; // Retrieve the current user's ID from the auth middleware

  if (!name && !avatar) {
    next(
      new BadRequestError("At least one field (name or avatar) is required")
    );
  }

  return User.findByIdAndUpdate(
    userId,
    { name, avatar }, // Update only the name and avatar fields
    {
      new: true, // Return the updated document
      runValidators: true, // Run validation rules defined in the schema
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
        next(new NotFoundError("User not found"));
      }

      if (err.name === "ValidationError") {
        next(new BadRequestError("Validation failed"));
      }

      if (err.name === "CastError") {
        next(new BadRequestError("Invalid ID"));
      } else {
        next(err);
      }
    });
};

// POST /login
const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new BadRequestError("Email and password are required"));
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
        next(new UnauthorizedError("Incorrect email or password"));
      } else {
        next(err);
      }
    });
};

// Export controllers
module.exports = { getCurrentUser, createUser, login, updateUser };
