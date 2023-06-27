import { promisify } from "util";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
	try {
		let token;

		// 1) getting token and check of it's true
		const { authorization } = req.headers;
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
		if (currentUser.changedPasswordAfter(decoded.iat)) {
			return next(
				new AppError("user recently changed password! please login again", 401)
			);
		}

		// GRANT ACCESS TO PROTECTED ROUTE
		res.locals.user = currentUser;
		req.user = currentUser;
		next();
	} catch (error) {
		next(new AppError(error.message, 401));
	}
};
