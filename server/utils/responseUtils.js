const sendError = (res, statusCode, message, data = {}) => {
	return res.status(statusCode).json({
		status: "failed",
		message,
		...data,
	});
};

const sendSuccess = (res, statusCode, message, data = {}) => {
	return res.status(statusCode).json({
		status: "success",
		message,
		...data,
	});
};

module.exports = {
	sendError,
	sendSuccess,
};
