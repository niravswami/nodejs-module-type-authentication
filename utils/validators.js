import User from "../models/userModel.js";

export const isNameValid = (value = "") => {
	const val = value.trim();
	let msg = "";
	if (val === "") {
		msg = "name field is required";
	} else if (val.length < 2 || val.length > 32) {
		msg = "name field must be 2 to 32 character long";
	}
	return msg;
};

export const isEmailValid = async (value = "", extra = { isUnique: false }) => {
	const val = value.trim();
	let msg = "";

	let regex =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	if (val === "") {
		msg = "email field is required";
	} else if (!regex.test(val)) {
		msg = "invalid email";
	} else if (extra?.isUnique) {
		const user = await User.exists({ email: val });
		if (user) {
			msg = "user already registered with this email";
		}
	}

	return msg;
};

export const isPasswordValid = (val = "", extra = { checkForLength: true }) => {
	let msg = "";
	if (val === "") {
		msg = "password field is required";
	} else if (extra?.checkForLength && val.length < 8) {
		msg = "password must be minimum 8 character long";
	}

	return msg;
};

export const isConfirmPasswordValid = (val = "", password = "") => {
	let msg = "";
	if (password === "") return msg;
	if (val === "") {
		msg = "confirm password field is required";
	} else if (val != password) {
		msg = "passwords are mot matching";
	}

	return msg;
};
