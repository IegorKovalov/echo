const jwt = require("jsonwebtoken");

const generateToken = (user) => {
	const payload = {
		id: user._id,
		email: user.email,
	};
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
	return token;
};
const sendToken = (user,res) => {
    const token = generateToken(user);
    
}
exports.login = async((req, res, next) => {});
exports.signUp = async((req, res, next) => {});
