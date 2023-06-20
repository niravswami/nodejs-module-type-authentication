import express from "express";
import { isAuthenticated } from "../features/isAuthenticated.js";
import { getUserInfo } from "../controllers/userController.js";
const router = express.Router();

router.get("/user-info", isAuthenticated, getUserInfo);

export default router;
