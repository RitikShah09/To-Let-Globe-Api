const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
// Define constants for user roles
const USER_ROLES = [
  "Buyer",
  "Tenant",
  "Owner",
  "User",
  "Admin",
  "Content Creator",
];

const userModel = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"],
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email Is Required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      unique: [true, "Email is already taken"],
    },
    phone: {
      type: String,
      unique: [true, "Phone number is already taken"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Ensure phone number is exactly 10 digits
        },
        message: "Phone number should be exactly 10 digits",
      },
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES, // Use constants for roles
        message: "{VALUE} is not a valid user role",
      },
      default: "User",
    },

    isVerified: { type: Boolean, default: false },
    password: {
      type: String,
      select: false,
      maxLength: [15, "Password should not exceed more than 15 characters"],
      minLength: [6, "Password should have atleast 6 characters"],
      //   match : []
    },
    resetPasswordToken: { type: String }, // Token for password reset
    resetPasswordExpire: { type: Date }, // Token expiration time
  },
  { timestamps: true }
);

userModel.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userModel.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userModel.methods.getJwtoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const User = mongoose.model("user", userModel);

module.exports = User;
