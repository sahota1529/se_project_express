const mongoose = require("mongoose");
const validator = require("validator");

const {
  Types: { ObjectId },
} = mongoose;

const clothingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The "name" field must be filled in'],
    minlength: [2, 'The minimum length of the "name" field is 2'],
    maxlength: [30, 'The maximum length of the "name" field is 30'],
  },
  weather: { type: String, emun: ["hot", "warm", "cold"], required: true },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "You must enter a valid URL",
    },
  },
  owner: { type: ObjectId, ref: "user", required: true },
  likes: {
    type: [{ type: ObjectId, ref: "user" }],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("clothingItem", clothingItemSchema);
