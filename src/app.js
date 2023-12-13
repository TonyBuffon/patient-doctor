// NPM MODULES
const express = require("express");
const morgan = require("morgan");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const chalk = require("chalk");

const swaggerUi = require("swagger-ui-express");
const swaggerOutput = require("./swagger-output.json");

const DoctorRoutes = require("./routes/doctorsRoutes");
const PatientsRoutes = require("./routes/patientsRoutes");

const AppError = require("./utils/AppError");
const globalErrorHandler = require("./utils/errorController");

const app = express();
app.use(cors());
app.use(helmet());

const limiter = rateLimiter({
  max: 20000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, Please try again in an hour",
});
app.use("/api", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize());
app.use(xss());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
const morganMiddleware = morgan(function (tokens, req, res) {
  return [
    chalk.hex("#34ace0").bold(tokens.method(req, res)),
    chalk.hex("#ffb142").bold(tokens.status(req, res)),
    chalk.hex("#ff5252").bold(tokens.url(req, res)),
    chalk.hex("#2ed573").bold(tokens["response-time"](req, res) + " ms"),
    chalk.hex("#f78fb3").bold("@ " + tokens.date(req, res)),
  ].join(" ");
});

app.use(morganMiddleware);
const port = process.env.PORT || 3000;

const swaggerUiOptions = {
  // url:`http://173.249.47.232:${process.env.PORT}/swagger.json`
  url: `http://localhost:${port}/swagger-output.json`,
};

// routes
app.use("/public", express.static("public"));
app.use("/api/v1/doctors", DoctorRoutes);
app.use("/api/v1/patients", PatientsRoutes);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerOutput, swaggerUiOptions)
);
app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
