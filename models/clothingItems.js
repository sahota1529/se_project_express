const mongoose = require("mongoose");
const validator = require("validator");

const clothingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The "name" field must be filled in'],
    minlength: [2, 'The minimum length of the "name" field is 2'],
    maxlength: [30, 'The maximum length of the "name" field is 30'],
  },
  weather: {
    type: String,
    emun: ["hot", "warm", "cold"],
    required: [true, "The weather type is required"],
  },
  imageUrl: {
    type: String,
    required: [true, "The URL field is required"],
    validate: {
      validator: (value) => validator.isURL(value),
      message: "You must enter a valid URL",
    },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true },
  likes: [
    {
      type: Array,
      default: [],
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ClothingItems = mongoose.model("ClothingItem", clothingItemSchema);

module.exports = { ClothingItems };
