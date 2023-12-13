const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const DoctorSchema = new mongoose.Schema(
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
    Patients: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Patients",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

DoctorSchema.index({ name: "text", email: "text" });

DoctorSchema.pre("save", async function (next) {
  //  Only run this function if password was actually modified-
  // Hash the password with cost of 12
  if (this.isModified("password") || this.isNew) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  }
  return next();
});

DoctorSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    this.passwordChangedAt = Date.now() - 10000;
    next();
  }

  return next();
});

DoctorSchema.methods.checkPassword = async function (
  candidatePassword,
  doctorPassword
) {
  return await bcrypt.compare(candidatePassword, doctorPassword);
};

DoctorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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

DoctorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const Doctors = mongoose.model("Doctors", DoctorSchema);
module.exports = Doctors;
