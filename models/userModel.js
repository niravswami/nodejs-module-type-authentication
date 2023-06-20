import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

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
		},
	},
	{ timestamps: true }
);

userSchema.pre("save", async function (next) {
	console.log("save", this);
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 12);
	// this.passwordConfirm = undefined;
	next();
});

// methods
userSchema.methods.correctPassword = async function (
	inputPassword,
	userPassword
) {
	return await bcrypt.compare(inputPassword, userPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
