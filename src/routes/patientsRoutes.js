const express = require("express");
const jwt = require("jsonwebtoken");

const patientsController = require("../controllers/patientController");
const authDoctor = require("../middlewares/authDoctor");
const authPatient = require("../middlewares/authPatient");
const router = express.Router();

router.post("/login", patientsController.login);
router.post("/create", authDoctor, patientsController.createPatient);
router.patch("/one/:id", authDoctor, patientsController.updateProfile);

router.get("/", authDoctor, patientsController.getAll);
router.get("/one/:id", authDoctor, patientsController.getOne);
router.get("/search", authDoctor, patientsController.searchInPatients);

router.get("/me", authPatient, patientsController.getMe);

module.exports = router;
