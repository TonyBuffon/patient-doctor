const express = require("express");

const doctorsController = require("../controllers/doctorsController");

const router = express.Router();

router.post("/register", doctorsController.register);
router.post("/login", doctorsController.login);

module.exports = router;
