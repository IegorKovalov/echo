const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
	try {
		const result = await resend.emails.send({
			from: "onboarding@resend.dev",
			to: options.email,
			subject: options.subject,
			html: options.message,
		});
		return result;
	} catch (error) {
		console.error("Email error:", error);
		throw error;
	}
};

module.exports = sendEmail;
