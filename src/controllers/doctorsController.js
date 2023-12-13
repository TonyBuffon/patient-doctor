const jwt = require("jsonwebtoken");
const Doctors = require("../models/DoctorsModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET_kEY_DOCTOR,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const newDoctor = await Doctors.create({
    name,
    email,
    password,
    Role: "doctor",
  });
  const token = signToken(newDoctor.id);
  delete newDoctor.password;
  res.status(201).send({
    token,
    doctor: newDoctor,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const doctor = await Doctors.findOne({ email }).select("+password");

  if (!doctor) {
    return next(
      new AppError(
        "Couldn't find doctor with this email, please re-check or try signing up.",
        401
      )
    );
  }
  if (!(await doctor.checkPassword(password, doctor.password))) {
    return next(new AppError("Incorrect identifier or password", 401));
  }
  delete doctor.password;
  const token = signToken(doctor.id);

  res.status(200).send({
    token,
    doctor,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  return res.send({ doctor: req.doctor });
});
