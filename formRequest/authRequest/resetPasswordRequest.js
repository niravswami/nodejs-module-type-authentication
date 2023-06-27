import {
	INVALID_REQUEST,
	SOMETHING_WENT_WRONG_TRY_AGAIN,
} from "../../utils/errorMessage.js";
import {
	isConfirmPasswordValid,
	isPasswordValid,
} from "../../utils/validators.js";

const isValidPasswordResetToken = (resetToken) => {
	let msg = "";
	if (resetToken === "") {
		msg = "invalid link";
	}

	return msg;
};

export default async (req, res, next) => {
	try {
		const { resetToken, password, password_confirm } = req.body;
		let errors = {};
		let errMsg = "";
		if ((errMsg = isValidPasswordResetToken(resetToken))) {
			errors.resetToken = errMsg;
		}
		if ((errMsg = isPasswordValid(password))) {
			errors.password = errMsg;
		}
		if ((errMsg = isConfirmPasswordValid(password_confirm, password))) {
			errors.password_confirm = errMsg;
		}
		if (Object.keys(errors).length > 0) {
			res.status(400).json({ success: false, msg: INVALID_REQUEST, errors });
		} else {
			next();
		}
	} catch (error) {
		console.log("error", error);
		res
			.status(500)
			.json({ success: false, msg: SOMETHING_WENT_WRONG_TRY_AGAIN });
	}
};
