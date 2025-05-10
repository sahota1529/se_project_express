const { ClothingItems } = require("../models/clothingItems");
const {
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR,
  FORBIDDEN,
} = require("../utils/errors");

// GET /items - Returns all clothing items
const getAllClothingItems = (req, res) => {
  ClothingItems.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      return res.status(SERVER_ERROR).send({
        message: "Error fetching clothing items",
      });
    });
};

// POST /items - Creates a new item
const createClothingItem = (req, res) => {
  console.log(req.user._id);

  const { name, weather, imageUrl } = req.body;

  ClothingItems.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: "Error creating item" });
      }
      return res.status(SERVER_ERROR).send({ message: "Error from item" });
    });
};

// DELETE /items/:itemId - Deletes an item by _id
const deleteClothingItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItems.findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== userId) {
        return res
          .status(FORBIDDEN)
          .send({ message: "You are not authorized to delete this item" });
      }

      // If authorized, delete the item
      return ClothingItems.findByIdAndDelete(itemId).then(() =>
        res.send({ message: "Item deleted successfully" })
      );
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      }
      if (err.name === "DocumentNotFoundError" || "TypeError") {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      return res.status(SERVER_ERROR).send({ message: "Error deleting item" });
    });
};

const likeItem = (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItems.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } },
    { new: true }
  )
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      return res.send(updatedItem);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: "Error liking this item" });
    });
};

const dislikeItem = (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItems.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true }
  )
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
      }
      return res.send(updatedItem);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID" });
      }
      return res
        .status(SERVER_ERROR)
        .send({ message: "Error disliking this item" });
    });
};

module.exports = {
  getAllClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeItem,
  dislikeItem,
};
