const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 20 },
  avatar: {
    type: String,
    required: [true, "The avatar fields is required."],
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "You must enter a valid URL",
    },
  },
  email: {
    type: String,
    required: [true, "The email field is required"],
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: [true, "The password field is required"],
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        console.log("User not found");
        return Promise.reject(new Error("Incorrect email or password"));
      }
      console.log("User found:", user);

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          console.log("Password does not match");

          return Promise.reject(new Error("Incorrect email or password"));
        }
        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
