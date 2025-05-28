const BadRequestError = require("../custom_errors/BadRequestError");
const ForbiddenError = require("../custom_errors/ForbiddenError");
const NotFoundError = require("../custom_errors/NotFoundError");
const { ClothingItems } = require("../models/clothingItems");

// GET /items - Returns all clothing items
const getAllClothingItems = (req, res, next) => {
  ClothingItems.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      next(err);
    });
};

// POST /items - Creates a new item
const createClothingItem = (req, res, next) => {
  console.log(req.user._id); // Access the hardcoded user ID

  const { name, weather, imageUrl } = req.body;

  ClothingItems.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        next(new BadRequestError("Error creating item"));
      } else {
        next(err);
      }
    });
};

// DELETE /items/:itemId - Deletes an item by _id
const deleteClothingItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id; // Logged-in user's ID

  ClothingItems.findById(itemId)
    .orFail()
    .then((item) => {
      // Check if the logged-in user is the owner
      if (item.owner.toString() !== userId) {
        return next(
          new ForbiddenError("You are not authorized to delete this item")
        );
      }

      // If authorized, delete the item
      return ClothingItems.findByIdAndDelete(itemId).then(() =>
        res.send({ message: "Item deleted successfully" })
      );
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      if (err.name === "DocumentNotFoundError" || err instanceof TypeError) {
        return next(new NotFoundError("Item not found"));
      }
      return next(err);
    });
};

const likeItem = (req, res, next) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItems.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: userId } }, // Add user ID if not already in the array
    { new: true } // Return the updated document
  )
    .then((updatedItem) => {
      if (!updatedItem) {
        return next(new NotFoundError("Item not found"));
      }
      return res.send(updatedItem);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid item ID"));
      } else {
        next(err);
      }
    });
};

const dislikeItem = (req, res, next) => {
  const userId = req.user._id;
  const { itemId } = req.params;

  ClothingItems.findByIdAndUpdate(
    itemId,
    { $pull: { likes: userId } },
    { new: true }
  )
    .then((updatedItem) => {
      if (!updatedItem) {
        return next(new NotFoundError("Item not found"));
      }
      return res.send(updatedItem);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid item ID"));
      }
      if (err.name === "DocumentNotFoundError" || err instanceof TypeError) {
        return next(new NotFoundError("Item not found"));
      }
      return next(err);
    });
};

module.exports = {
  getAllClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeItem,
  dislikeItem,
};
