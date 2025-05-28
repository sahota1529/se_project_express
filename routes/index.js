const router = require("express").Router();
const NotFoundError = require("../custom_errors/NotFoundError");
const userRouter = require("./users");
const clothingRouter = require("./clothingItems");
const { login, createUser } = require("../controllers/users");
const {
  validateUserLogin,
  validateUserInfo,
} = require("../middlewares/validation");

console.log("Routes initialized");
router.post("/signin", validateUserLogin, login);
router.post("/signup", validateUserInfo, createUser);

// router.use(auth);

router.use("/users", userRouter);
router.use("/items", clothingRouter);

// Handling non-existent resources
router.use((req, res, next) => {
  next(new NotFoundError("Router not found"));
});

module.exports = router;
