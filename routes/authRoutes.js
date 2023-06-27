import express from "express";
import signupRequest from "../formRequest/authRequest/signupRequest.js";
import loginRequest from "../formRequest/authRequest/loginRequest.js";
import {
	ResetPassword,
	forgotPassword,
	login,
	logout,
	signup,
} from "../controllers/authController.js";
import { isAuthenticated } from "../features/isAuthenticated.js";
import forgotPasswordRequest from "../formRequest/authRequest/forgotPasswordRequest.js";
import resetPasswordRequest from "../formRequest/authRequest/resetPasswordRequest.js";

const router = express.Router();

// Register
router.post("/signup", signupRequest, signup);

// Login
router.post("/login", loginRequest, login);

// Verify email

// Send email verification

// forgot password
router.post("/forgot-password", forgotPasswordRequest, forgotPassword);

// reset password
router.post("/reset-password/:resetToken", resetPasswordRequest, ResetPassword);

// logout
router.post("/logout", isAuthenticated, logout);

export default router;
