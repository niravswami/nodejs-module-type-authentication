import {
	INVALID_REQUEST,
	SOMETHING_WENT_WRONG_TRY_AGAIN,
} from "../../utils/errorMessage.js";
import { isEmailValid } from "../../utils/validators.js";

export default async (req, res, next) => {
	try {
		const { email } = req.body;
		let errors = {};
		let errMsg = "";
		if ((errMsg = await isEmailValid(email))) {
			errors.email = errMsg;
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
