import jwt from "jsonwebtoken";

const createToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "10m",
	});
};

export const createAndSendToken = (res, user = null, statusCode = 200) => {
	try {
		const token = createToken(user._id);

		const cookieOptions = {
			maxAge: 1000 * 60 * 10,
			sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
		};

		res.cookie("token", token, cookieOptions);
		user.password = undefined;

		res.status(statusCode).json({
			success: true,
			token,
			user,
		});
	} catch (error) {
		console.log("createAndSendToken", error.message);
		res.status(500).json({
			success: false,
			token,
			user,
		});
	}
};
