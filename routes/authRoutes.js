import express from "express";
import signupRequest from "../formRequest/authRequest/signupRequest.js";
import loginRequest from "../formRequest/authRequest/loginRequest.js";
import { login, logout, signup } from "../controllers/authController.js";
import { isAuthenticated } from "../features/isAuthenticated.js";

const router = express.Router();

// Register
router.post("/signup", signupRequest, signup);

// Login
router.post("/login", loginRequest, login);

// Verify email

// Send email verification

// forgot password

// reset password

// logout
router.post("/logout", isAuthenticated, logout);

export default router;
