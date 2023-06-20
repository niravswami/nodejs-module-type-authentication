import {
	INVALID_REQUEST,
	SOMETHING_WENT_WRONG_TRY_AGAIN,
} from "../../utils/errorMessage.js";
import {
	isConfirmPasswordValid,
	isEmailValid,
	isNameValid,
	isPasswordValid,
} from "../../utils/validators.js";

export default async (req, res, next) => {
	try {
		const { name, email, password, password_confirm } = req.body;
		let errors = {};
		let errMsg = "";
		if ((errMsg = isNameValid(name))) {
			errors.name = errMsg;
		}
		if ((errMsg = await isEmailValid(email, { isUnique: true }))) {
			errors.email = errMsg;
		}
		if ((errMsg = isPasswordValid(password))) {
			errors.password = errMsg;
		}
		if ((errMsg = isConfirmPasswordValid(password_confirm, password))) {
			errors.password_confirm = errMsg;
		}
		if (Object.keys(errors).length > 0) {
			console.log("errors", errors);
			res.status(400).json({ success: false, msg: INVALID_REQUEST, errors });
		} else {
			next();
		}
	} catch (error) {
		res
			.status(500)
			.json({ success: false, msg: SOMETHING_WENT_WRONG_TRY_AGAIN });
	}
};
