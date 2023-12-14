const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const Doctor = require("../models/DoctorsModel");

module.exports = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // 2) Verification token

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY_DOCTOR
  );

  // 3) Check if dcotor still exists

  const currentDoctor = await Doctor.findById(decoded.id).populate([
    "Patients",
  ]);
  if (!currentDoctor) {
    return next(
      new AppError(
        "The Doctor belonging to this token does no longer exist.",
        401
      )
    );
  }

  //  4) Check if user changed password after the token was issued

  if (currentDoctor.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "This User recently changed their password! Please login again!",
        401
      )
    );
  }
  //  GRANT ACCESS TO PROTECTED ROUTES
  req.doctor = currentDoctor;
  next();
});
