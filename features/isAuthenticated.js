import { promisify } from "util";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const isAuthenticated = async (req, res, next) => {
	try {
		let token;

		// 1) getting token and check of it's true
		const { authorization } = req.headers;
		console.log("authorization", authorization);
		if (authorization && authorization.startsWith("Bearer")) {
			token = authorization.split(" ")[1];
		} else if (req.cookies.token) {
			token = req.cookies.token;
		}

		if (!token) {
			return next(
				new AppError("you are not logged in! please login to access", 401)
			);
		}

		// 2) verification token
		console.log("process.env.JWT_SECRET", process.env.JWT_SECRET);
		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

		// 3) check if user still exists
		const currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return next(
				new AppError("The user belonging to this token does not exist", 401)
			);
		}

		// 4) check if user changed password after the token was issued
		// here "iat" means issued at
		// if (currentUser.changedPasswordAfter(decoded.iat)) {
		// 	return next(
		// 		new AppError("user recently changed password! please login again", 401)
		// 	);
		// }

		// GRANT ACCESS TO PROTECTED ROUTE
		res.locals.user = currentUser;
		req.user = currentUser;
		next();
	} catch (error) {
		res.status(500).json({ success: false, msg: error.message });
		next(new AppError(error.message, error?.statusCose));
	}
};
