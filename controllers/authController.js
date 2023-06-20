import { createAndSendToken } from "../features/createAndSendCookie.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import {
	INVALID_REQUEST,
	SOMETHING_WENT_WRONG_TRY_AGAIN,
} from "../utils/errorMessage.js";

// Register
export const signup = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		console.log("req.body;", req.body);
		const user = await User.create({
			name,
			email,
			password,
		});

		createAndSendToken(res, user, 201);
	} catch (error) {
		res
			.status(500)
			.json({ success: false, msg: SOMETHING_WENT_WRONG_TRY_AGAIN });
	}
};

// Login
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email }).select("+password");

		if (!user || !(await user.correctPassword(password, user.password))) {
			return res.status(401).json({
				success: false,
				msg: INVALID_REQUEST,
				errors: { email: "incorrect email or password" },
			});
		}

		createAndSendToken(res, user, 200);
	} catch (error) {
		res
			.status(500)
			.json({ success: false, msg: SOMETHING_WENT_WRONG_TRY_AGAIN });
	}
};

// Logout
export const logout = async (req, res, next) => {
	try {
		const cookieOptions = {
			expires: new Date(Date.now() + 1 * 1000),
			httpOnly: true,
		};

		res.cookie("token", "loggedout", cookieOptions);
		res.status(200).json({
			success: true,
			message: "logged out",
		});
	} catch (error) {
		res
			.status(500)
			.json({ success: false, msg: SOMETHING_WENT_WRONG_TRY_AGAIN });
	}
};
