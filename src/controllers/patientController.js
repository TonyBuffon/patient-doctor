const generator = require("generate-password");
const Patients = require("../models/PatientModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");
const Doctors = require("../models/DoctorsModel");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET_kEY_PATIENT,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

exports.searchInPatients = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  let patients = await Patients.find({
    $text: { $search: `${q}`, $caseSensitive: false },
  });
  res.status(200).send({ patients });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const patient = await Patients.findOne({ email }).select("+password");

  if (!patient) {
    return next(
      new AppError(
        "Couldn't find patient with this email, please re-check or try signing up.",
        401
      )
    );
  }
  if (!(await patient.checkPassword(password, patient.password))) {
    return next(new AppError("Incorrect identifier or password", 401));
  }
  delete patient.password;
  const token = signToken(patient.id);

  res.status(200).send({
    token,
    patient,
  });
});

exports.createPatient = catchAsync(async (req, res, next) => {
  let doctor = req.doctor;
  let password = generator.generate({
    length: 12,
    numbers: true,
    lowercase: true,
    uppercase: true,
  });
  let { name, email, medicalHistory, diagnoses, notes, drugs } = req.body;
  let checkIfCreated = await Patients.findOne({ email });
  if (!checkIfCreated) {
    let newPatient = await Patients.create({
      name,
      email,
      medicalHistory,
      diagnoses,
      notes,
      drugs,
      Doctors: [doctor.id],
      password,
    });
    await Doctors.findByIdAndUpdate(doctor.id, {
      Patients: [...doctor.Patients, newPatient.id],
    });
    await new Email(newPatient, doctor.name, password).send(
      "sendWelcome",
      "Welcome to our system!"
    );
    return res.send({ patient: newPatient });
  }
  if (!checkIfCreated.Doctors.includes(doctor.id)) {
    checkIfCreated.Doctors.push(doctor.id);
    checkIfCreated.medicalHistory.push(...medicalHistory);
    checkIfCreated.diagnoses.push(...diagnoses);
    checkIfCreated.notes.push(...notes);
    checkIfCreated.drugs.push(...drugs);
    await checkIfCreated.save();
    await Doctors.findByIdAndUpdate(doctor.id, {
      Patients: [...doctor.Patients, checkIfCreated.id],
    });
    await new Email(checkIfCreated, doctor.name).sendUpdate();

    return res.send({ patient: checkIfCreated });
  } else {
    checkIfCreated.medicalHistory.push(...medicalHistory);
    checkIfCreated.diagnoses.push(...diagnoses);
    checkIfCreated.notes.push(...notes);
    checkIfCreated.drugs.push(...drugs);
    await checkIfCreated.save();

    await new Email(checkIfCreated, doctor.name).sendUpdate();

    return res.send({ patient: checkIfCreated });
  }
});

exports.getMe = catchAsync(async (req, res, next) => {
  return res.send({ patient: req.patient });
});

exports.getOne = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  const patient = await Patients.findById(id);
  if (!patient) {
    return next(new AppError("No patient found for this id", 404));
  }
  return res.send({ patient });
});
exports.getAll = catchAsync(async (req, res, next) => {
  const patients = await Patients.find();
  return res.send({ patients });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const doctor = req.doctor;
  const { medicalHistory, diagnoses, notes, drugs } = req.body;
  const patient = await Patients.findById(id);
  patient.medicalHistory = medicalHistory;
  patient.diagnoses = diagnoses;
  patient.notes = notes;
  patient.drugs = drugs;
  await patient.save();
  await new Email(patient, doctor.name).sendUpdate();

  return res.send({ patient });
});
