import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			require: [true, "name field is required"],
			validate: {
				validator: function (name) {
					return name.trim() !== "";
				},
				message: "{PATH} field is required",
			},
		},
		email: {
			type: String,
			required: [true, "email field is required"],
			lowercase: true,
			unique: true,
			validator: [validator.isEmail, "invalid email"],
		},
		password: {
			type: String,
			required: [true, "password field is required"],
			minlength: [8, "minimum password length is 8"],
			select: false,
		},
		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
	console.log("save", this);
	if (!this.isModified("password")) return next();
	this.password = bcrypt.hash(this.password, 12);
	next();
});

userSchema.pre("save", function (next) {
	// only run this function if password is modified
	if (!this.isModified("password") || this.isNew) {
		return next();
	}

	// Date.now() - 1000 is just a heck to work token properly, because sometimes document save takes time and Date.now is not workinf properly
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

// methods
userSchema.methods.correctPassword = async function (
	inputPassword,
	userPassword
) {
	return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimeStamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		); // getTime() gives time in milliseconds so divide by 1000 gives in seconds with base 10

		return JWTTimestamp < changedTimeStamp; // ex: 100 < 200
	}

	// false means not changed
	return false;
};

userSchema.methods.createPasswordResetToken = async function () {
	const resetToken = crypto.randomBytes(32).toString("hex");
	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
