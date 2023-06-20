export const getUserInfo = async (req, res, next) => {
	const user = req.user;

	res.status(200).json({
		success: true,
		user: { _id: user._id, name: user.name, eamil: user.email },
	});
};
