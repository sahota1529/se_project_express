const ClothingItem = require("../models/clothingItems");
const statusCodes = require("../utils/errors");

const createItem = (req, res) => {
  console.log(req.body);
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        return res
          .status(statusCodes.INVALID_DATA_ERROR)
          .send({ message: "Input is incorrect" });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Item creation unsuccesful" });
    });
};

const getItems = (req, res) => {
  ClothingItem.find()
    .then((item) => {
      res.status(statusCodes.OK).send(item);
    })
    .catch((err) => {
      console.error(err);
      res
        .status(statusCodes.NOT_FOUND_ERROR)
        .send({ message: "Item not found" });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  console.log(itemId);

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then(() => {
      res.status(statusCodes.OK).send({ message: "Item successfully deleted" });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res
          .status(statusCodes.INVALID_DATA_ERROR)
          .send({ message: "Input is incorrect" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(statusCodes.NOT_FOUND_ERROR)
          .send({ message: "Input was not found" });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Input was not found" });
    });
};

const likeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((itemId) => {
      res.status(statusCodes.CREATED).send(itemId);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res
          .status(statusCodes.INVALID_DATA_ERROR)
          .send({ message: "Input is incorrect" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(statusCodes.NOT_FOUND_ERROR)
          .send({ message: "Input was not found" });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Input was not found" });
    });
};

const dislikeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then(() => {
      res
        .status(statusCodes.OK)
        .send({ message: "Item was sucessfully disliked" });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res
          .status(statusCodes.INVALID_DATA_ERROR)
          .send({ message: "Input is incorrect" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(statusCodes.NOT_FOUND_ERROR)
          .send({ message: "Input was not found" });
      }
      return res
        .status(statusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Input was not found" });
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
