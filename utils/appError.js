class AppError extends Error {
	constructor(message, statusCode) {
		super(message);

		this.statusCode = statusCode;
		this.isOperational = true;
		this.msg = message;

		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;
