import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import ms from "ms";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/email.js";
import crypto from "crypto";

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

/**
 * @function generateAccessAndRefreshTokens
 * @description Generate access and refresh tokens
 * @param {String} userId - The user ID
 * @returns {Object} - The access and refresh tokens
 */
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate access and refresh tokens.");
  }
};

/**
 * @function registerUser
 * @description Register a new user
 * @route POST /api/v1/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
  try {
    const { fullName, username, email, phone, password } = req.body;

    // Check if the username already exist
    const existedUsername = await User.findOne({ username });
    if (existedUsername) {
      throw new ApiError(400, "Username already exists.");
    }

    // Check if the email already exists
    const existedEmail = await User.findOne({ email });
    if (existedEmail) {
      throw new ApiError(400, "Email already exists.");
    }

    // Check if the phone number already exists
    const existedPhone = await User.findOne({ phone });
    if (existedPhone) {
      throw new ApiError(400, "Phone number already exists.");
    }

    // Check if the avatar is uploaded
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required.");
    }

    // Upload the avatar on Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(500, "Failed to upload avatar.");
    }

    // Create a new user
    await User.create({
      fullName,
      username,
      email,
      phone,
      password,
      avatar: avatar.secure_url,
    });

    res.status(201).json(new ApiResponse("User registered successfully."));
  } catch (error) {
    next(error);
  }
});

/**
 * @function loginUser
 * @description Login a user
 * @route POST /api/v1/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    req.user?._id
  );

  const { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = process.env;

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...options,
      expires: new Date(Date.now() + ms(ACCESS_TOKEN_EXPIRY)),
    })
    .cookie("refreshToken", refreshToken, {
      ...options,
      expires: new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRY)),
    })
    .json(new ApiResponse("User logged in successfully.", req.user));
});

/**
 * @function logoutUser
 * @description Logout a user
 * @route POST /api/v1/users/logout
 * @access Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 }, // this removes the field from document
    },
    { new: true }
  );
  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse("User logged out successfully."));
});

/**
 * @function refreshAccessToken
 * @description Refresh the access token
 * @route POST /api/v1/users/refresh-token
 * @access Public
 */
const refreshAccessToken = asyncHandler(async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request.");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "Unauthorized request.");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Unauthorized request.");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = process.env;

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...options,
        expires: new Date(Date.now() + ms(ACCESS_TOKEN_EXPIRY)),
      })
      .cookie("refreshToken", refreshToken, {
        ...options,
        expires: new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRY)),
      })
      .json(new ApiResponse("Access token refreshed."));
  } catch (error) {
    next(error);
  }
});

/**
 * @function getCurrentUser
 * @description Get the current user
 * @route GET /api/v1/users/current-user
 * @access Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse("User fetched successfully.", req.user));
});

/**
 * @function changeCurrentPassword
 * @description Change the current password
 * @route PATCH /api/v1/users/change-password
 * @access Private
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old password is incorrect.");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse("Password changed successfully."));
});

/**
 * @function updateUserProfile
 * @description Update the user profile
 * @route PATCH /api/v1/users/profile
 * @access Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, username, email, phone } = req.body;
  console.log(req.user);

  // Check if the username already exist
  const existedUsername = await User.findOne({
    $and: [{ username }, { username: { $ne: req.user?.username } }],
  });
  if (existedUsername) {
    throw new ApiError(400, "Username already exists.");
  }

  // Check if the email already exists
  const existedEmail = await User.findOne({
    $and: [{ email }, { email: { $ne: req.user?.email } }],
  });
  if (existedEmail) {
    throw new ApiError(400, "Email already exists.");
  }

  // Check if the phone number already exists
  const existedPhone = await User.findOne({
    $and: [{ phone }, { phone: { $ne: req.user?.phone } }],
  });
  if (existedPhone) {
    throw new ApiError(400, "Phone number already exists.");
  }

  let avatar = {};
  // Check if the avatar is uploaded
  const avatarLocalPath = req.file?.path;
  if (avatarLocalPath) {
    // Upload the avatar on Cloudinary
    avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(500, "Failed to upload avatar.");
    }
  }

  // Update the user profile
  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: avatar?.secure_url || req.user?.avatar,
      fullName,
      username,
      email,
      phone,
    },
  });

  res.status(200).json(
    new ApiResponse("User profile updated successfully.", {
      _id: user._id,
      avatar: avatar.secure_url || user.avatar,
      fullName,
      username,
      email,
      phone,
    })
  );
});

/**
 * @function resetPasswordRequest
 * @description Request to reset the password
 * @route POST /api/v1/users/reset-password-request
 * @access Public
 */
const resetPasswordRequest = asyncHandler(async (req, res) => {
  const email = req.body?.email;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist.");
  }

  // Generate reset password token
  const resetPasswordToken = user.generateResetPasswordToken();
  await user.save();

  // Send the reset password email
  const resetPasswordUrl = `${process.env.CORS_ORIGIN}/reset-password/${resetPasswordToken}`;
  const options = {
    email,
    subject: "Reset Password",
    message: `
      Hi ${user.fullName},<br />
      You requested to reset your password. <br />
      Please, click the link below to reset your password.<br />
      <a href=${resetPasswordUrl}>Reset Password</a>
    `,
  };

  const send = await sendEmail(options);
  if (!send) {
    throw new ApiError(500, "Failed to send the reset password email.");
  }

  res.status(200).json(new ApiResponse("Reset password email sent."));
});

/**
 * @function resetPassword
 * @description Reset the password
 * @route PATCH /api/v1/users/reset-password/:resetPasswordToken
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = req.params?.resetPasswordToken;
  const newPassword = req.body?.newPassword;

  // hashed reset password token
  const hashedResetPasswordToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");

  // Find user with the reset password token
  const user = await User.findOne({
    resetPasswordToken: hashedResetPasswordToken,
    resetPasswordTokenExpiry: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError(400, "Invalid or expired reset password token.");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiry = undefined;
  await user.save();

  res.status(200).json(new ApiResponse("Password reset successfully."));
});

/**
 * @function getUsersForSidebar
 * @description Get users for the sidebar
 * @route GET /api/v1/users
 * @access Private
 */
const getUsersForSidebar = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user?._id } }).select(
    "-password -resetPasswordToken -resetPasswordTokenExpiry -__v"
  );
  res.status(200).json(new ApiResponse("Users fetched successfully.", users));
});

/**
 * @function searchUsers
 * @description Search users
 * @route GET /api/v1/users/search?query=
 * @access Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.query;

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { fullName: { $regex: new RegExp(query, "i") } },
      { username: { $regex: new RegExp(query, "i") } },
    ],
  });

  res.status(200).json(new ApiResponse("Users fetched successfully.", users));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateUserProfile,
  resetPasswordRequest,
  resetPassword,
  getUsersForSidebar,
  searchUsers,
};
