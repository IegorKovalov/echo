const createPasswordResetMessage = (resetURL) => {
	return `Subject: Your Password Reset Request
  
  Hello,
  
  You requested a password reset for your account. Please click the link below to reset your password:
  
  ${resetURL}
  
  This link is valid for 10 minutes only.
  
  If you didn't request this password reset, please ignore this email.
  
  Regards,
  Bo Navi Keter Ya Manyak!`;
};

module.exports = createPasswordResetMessage;
