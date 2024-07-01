import { Router } from "express";
import * as user from "../controllers/user.controller.js";
import passport from "passport";
import upload from "../middlewares/multer.middleware.js";
import verifyJwt from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validation.middleware.js";
import * as validation from "../validations/user.validation.js";

const router = Router();

router
  .post(
    "/register",
    upload.single("avatar"),
    validate(validation.userSignupSchema),
    user.registerUser
  )
  .post(
    "/login",
    validate(validation.userLoginSchema),
    passport.authenticate("local"),
    user.loginUser
  )
  .post("/logout", verifyJwt, user.logoutUser)
  .post("/refresh-token", user.refreshAccessToken)
  .post("/current-user", verifyJwt, user.getCurrentUser)
  .post(
    "/change-password",
    verifyJwt,
    validate(validation.changePasswordSchema),
    user.changeCurrentPassword
  )
  .patch(
    "/update-profile",
    verifyJwt,
    upload.single("avatar"),
    validate(validation.updateUserProfileSchema),
    user.updateUserProfile
  )
  .post(
    "/reset-password-request",
    validate(validation.resetPasswordRequestSchema),
    user.resetPasswordRequest
  )
  .post(
    "/reset-password/:resetPasswordToken",
    validate(validation.resetPasswordSchema),
    user.resetPassword
  )
  .get("/", verifyJwt, user.getUsersForSidebar)
  .get("/search", verifyJwt, user.searchUsers);

export default router;
