require("dotenv").config();
const { errors } = require("celebrate");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes/index");
const errorHandler = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
const { PORT = 3001 } = process.env;

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(requestLogger);
// Routes
app.use("/", routes);

mongoose.set("strictQuery", false);
mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);
