const router = require("express").Router();
const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const statusCodes = require("../utils/errors");
const { login, createUser } = require("../controllers/users");

router.use("/users", userRouter);
router.use("/items", itemRouter);
router.post("/signin", login);
router.post("/signup", createUser);

router.use((req, res) => {
  res.status(statusCodes.NOT_FOUND_ERROR).send({ message: "Router not found" });
});

module.exports = router;
