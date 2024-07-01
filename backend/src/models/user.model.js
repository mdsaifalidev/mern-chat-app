import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    avatar: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

/**
 * @middleware - Hash the password before saving the user model
 * @function pre
 * @name save
 * @param {Function} next - Callback function to move to the next middleware
 * @returns {Function} next - Callback function to move to the next middleware
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * @method - Compare the password with the hashed password
 * @function isPasswordCorrect
 * @param {String} password - The password to compare
 * @returns {Boolean} - True if the password is correct, False otherwise
 */
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * @method - Generate the access token for the user
 * @function generateAccessToken
 * @returns {String} - The access token for the user
 */
userSchema.methods.generateAccessToken = function () {
  const { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY } = process.env;
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * @method - Generate the refresh token for the user
 * @function generateRefreshToken
 * @returns {String} - The refresh token for the user
 */
userSchema.methods.generateRefreshToken = function () {
  const { REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY } = process.env;
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateResetPasswordToken = function () {
  // Generate the reset password token
  const resetPasswordToken = crypto.randomBytes(36).toString("hex");

  // Hash the reset password token and set it to the user model
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");

  this.resetPasswordTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetPasswordToken;
};

const User = mongoose.model("User", userSchema);
export default User;
