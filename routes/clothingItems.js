const router = require("express").Router();
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, createItem);
router.get("/", getItems);
router.delete("/:itemId", authMiddleware, deleteItem);
router.put("/:itemId/likes", authMiddleware, likeItem);
router.delete("/:itemId/likes", authMiddleware, dislikeItem);

module.exports = router;
