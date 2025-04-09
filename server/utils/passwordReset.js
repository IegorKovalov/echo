const createPasswordResetMessage = (resetURL) => {
	return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 0.9em;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Hello,</p>
    <p>You requested a password reset for your account. Please click the button below to reset your password:</p>
    
    <a href="${resetURL}" class="button">Reset Your Password</a>
    
    <p>This link is valid for 10 minutes only.</p>
    <p>If you didn't request this password reset, please ignore this email.</p>
    
    <div class="footer">
      <p>Regards,<br>Your App Team</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = createPasswordResetMessage;
