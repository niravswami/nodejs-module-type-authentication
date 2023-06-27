import crypto from "crypto";
import { createAndSendToken } from "../features/createAndSendCookie.js";
import User from "../models/userModel.js";
import {
	INVALID_REQUEST,
	SOMETHING_WENT_WRONG_TRY_AGAIN,
} from "../utils/errorMessage.js";

import Email from "../features/email.js";

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

// Forgot password
export const forgotPassword = async (req, res, next) => {
	const { email } = req.body;
	const user = await User.findOne({ email });

	try {
		if (!user) {
			return res.status(404).json({
				success: false,
				msg: INVALID_REQUEST,
				errors: {
					email: "No user associate with this email address",
				},
			});
		}

		const resetToken = await user.createPasswordResetToken();

		await user.save({ validateBeforeSave: false });

		const resetUrl = `${req.protocol}://${process.env.DOMAIN_NAME}/reset-password/${resetToken}`;

		await new Email(user, { url: resetUrl }).sendPasswordReset();
		res.status(200).json({
			success: true,
			msg: "Link has been sent to your email address",
		});
	} catch (error) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });
		res.status(500).json({
			success: false,
			msg: "There was an error sending the email. Try again later",
		});
	}
};

export const ResetPassword = async (req, res, next) => {
	try {
		const resetToken = req.params.resetToken;
		const hashedToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		const user = await User.findOne({
			passwordResetToken: hashedToken,
			passwordResetExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res
				.status(400)
				.json({ success: false, msg: "invalid link or link has been expired" });
		}

		user.password = req.body.password;
		user.passwordConfirm = req.body.passwordConfirm;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		res.status(200).json({
			success: true,
			msg: "Password has been updated. Please login to continue.",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			msg: SOMETHING_WENT_WRONG_TRY_AGAIN,
		});
	}
};
