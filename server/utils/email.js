const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
	try {
		const result = await resend.emails.send({
			from: "Social Network <onboarding@resend.dev>",
			to: options.email,
			subject: options.subject,
			html: options.message,
		});
		if (result.error) {
			throw new Error(`Resend API error: ${result.error}`);
		}
		return result;
	} catch (error) {
		console.error("Email error:", error);
		throw error;
	}
};

module.exports = sendEmail;
