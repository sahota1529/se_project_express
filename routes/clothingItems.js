const router = require("express").Router();
const {
  validateClothingItem,
  validateItemId,
} = require("../middlewares/validation");
const auth = require("../middlewares/auth");
const {
  getAllClothingItems,
  createClothingItem,
  deleteClothingItem,
  /* updateClothingItem, */
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

// GET /items - Returns all clothing items
router.get("/", getAllClothingItems);

// POST /items - Creates a new clothing item
router.post("/", auth, validateClothingItem, createClothingItem);

// DELETE /items/:itemId - Deletes an item by _id
router.delete("/:itemId", auth, validateItemId, deleteClothingItem);

// Add and Delete Likes
router.put("/:itemId/likes", auth, validateItemId, likeItem);
router.delete("/:itemId/likes", auth, validateItemId, dislikeItem);

module.exports = router;
