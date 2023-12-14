const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./src/.env" });
const app = require("./src/app");

const DB = process.env.DATABASE_URL;
mongoose.connect(DB).then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on ${port}......`);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLER REJECTION!! ..... Shuting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
module.exports = server;
