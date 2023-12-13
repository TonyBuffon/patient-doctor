const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const PatientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Provide us a name"],
    },
    email: {
      type: String,
      required: [true, "Please Provide us a email"],
      lowercase: true,
      unique: [true, "This email is already registered."],
      validate: [validator.isEmail, "Please provide us a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide us a password"],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    medicalHistory: [
      {
        type: String,
      },
    ],
    diagnoses: [{ type: String }],
    notes: [{ type: String }],
    drugs: [{ type: String }],
    Doctors: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Doctors",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PatientSchema.index({ name: "text", email: "text" });

PatientSchema.pre("save", async function (next) {
  //  Only run this function if password was actually modified-
  // Hash the password with cost of 12
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  }
  return next();
});

PatientSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    this.passwordChangedAt = Date.now() - 10000;
    next();
  }

  return next();
});

PatientSchema.methods.checkPassword = async function (
  candidatePassword,
  patientPassword
) {
  return await bcrypt.compare(candidatePassword, patientPassword);
};

PatientSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changeTimestamp;
  } else {
    return false;
  }
};

PatientSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Patients = mongoose.model("Patients", PatientSchema);
module.exports = Patients;
