const brevo = require("@getbrevo/brevo");

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
	brevo.TransactionalEmailsApiApiKeys.apiKey,
	process.env.BREVO_API_KEY
);

const sendEmail = async (options) => {
	try {
		const sendSmtpEmail = new brevo.SendSmtpEmail();
		sendSmtpEmail.to = [{ email: options.email }];
		sendSmtpEmail.subject = options.subject;
		sendSmtpEmail.htmlContent = options.message;
		sendSmtpEmail.sender = {
			name: "echo",
			email: "echoscoialapp@gmail.com",
		};

		const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
		return result;
	} catch (error) {
		console.error("Email error:", error);
		throw error;
	}
};

module.exports = sendEmail;
