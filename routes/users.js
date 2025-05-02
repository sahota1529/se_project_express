const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");
const authMiddleware = require("../middlewares/auth");

// start with /users
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/me", authMiddleware, updateUser);

module.exports = router;
