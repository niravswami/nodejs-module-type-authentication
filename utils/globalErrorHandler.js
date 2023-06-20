import AppError from "./appError.js";

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
	const dupField = Object.keys(err.keyValue)[0];
	let message = `Duplicate field: ${dupField}. Please use another value (${err.keyValue[dupField]})!`;
	if (dupField === "email") {
		message = `The email ${err.keyValue[dupField]} is already registered!`;
	}
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);
	const message = `Invalid input data. ${errors.join(". ")}`;
	return new AppError(message, 400);
};

const handleJWTError = () => {
	return new AppError("Invalid token. please login again!", 401);
};
const handleTokenExpiredError = () => {
	return new AppError("your token has expired. please login again!", 401);
};

const sendDevError = (err, res, req) => {
	console.log("err", err);
	let response = {
		success: false,
		msg: err.message || err.msg || "something went wrong!",
		stack: err.stack,
	};
	if (typeof err.msg === "object") {
		response.error = err.msg;
		response.msg = JSON.stringify(err.msg);
	}
	if (req.originalUrl.startsWith("/api")) {
		return res.status(err.statusCode).json(response);
	} else {
		res.status(err.statusCode).render("error", response);
	}
};

const sendProdError = (err, res, req) => {
	if (req.originalUrl.startsWith("/api")) {
		let response = {
			success: false,
			msg: err.message || err.msg || "something went wrong!",
		};
		if (typeof err.msg === "object") {
			response.error = err.msg;
			response.msg = "error";
		}
		return res.status(err.statusCode).json(response);
	}

	if (err.isOperational) {
		return res.status(err.statusCode).render("error", {
			title: "something went wrong!",
			msg: err.message || err.msg || "something went wrong!",
			success: false,
		});
	} else {
		return res.status(err.statusCode).render("error", {
			msg: "Please try again",
			success: false,
		});
	}
};

export default (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	if (process.env.NODE_ENV.trim() === "development") {
		return sendDevError(err, res, req);
	} else if (process.env.NODE_ENV.trim() === "production") {
		let error = { ...err };
		console.log("err.name", err.name, err.message, err, "error", error);
		if (err.name === "CastError") error = handleCastErrorDB(error);
		if (err?.code === 11000) error = handleDuplicateFieldsDB(error);
		if (err.name === "ValidationError") error = handleValidationErrorDB(error);
		if (err.name === "JsonWebTokenError") error = handleJWTError();
		if (err.name === "TokenExpiredError") error = handleTokenExpiredError();

		return sendProdError(error, res, req);
	}
};
