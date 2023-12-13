const express = require("express");

const doctorsController = require("../controllers/doctorsController");
const authDoctor = require("../middlewares/authDoctor");

const router = express.Router();

router.post("/register", doctorsController.register);
router.post("/login", doctorsController.login);

router.get("/me", authDoctor, doctorsController.getMe);

module.exports = router;
