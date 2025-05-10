const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes/index");

const app = express();
const { PORT = 3001 } = process.env;

app.use(cors());
app.use(helmet());
app.use(express.json());
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
