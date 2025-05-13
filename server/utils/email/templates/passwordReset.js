const createPasswordResetMessage = (resetURL) => {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Echo Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #121212;
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #ffffff;
    }

    .email-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: #1a1a1a;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    }

    .email-header {
      background: linear-gradient(to right, #ec4899, #f43f5e);
      padding: 24px;
      text-align: center;
    }

    .email-header h1 {
      margin: 0;
      font-size: 28px;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .email-body {
      padding: 30px 24px;
    }

    .email-body h2 {
      font-size: 22px;
      font-weight: 600;
      color: #ec4899;
      margin-bottom: 16px;
    }

    .email-body p {
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 20px;
      color: #e4e4e7;
    }

    .button-container {
      margin: 30px 0;
      text-align: center;
    }

    .button {
      background-color: #ec4899;
      color: #ffffff;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      display: inline-block;
    }

    .message-box {
      background-color: #2c2c2c;
      border-left: 4px solid #ec4899;
      padding: 16px;
      font-size: 14px;
      color: #d1d5db;
      margin-top: 30px;
    }

    .email-footer {
      text-align: center;
      padding: 20px;
      font-size: 13px;
      color: #777;
    }

    @media (max-width: 600px) {
      .email-body {
        padding: 20px 16px;
      }

      .button {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>echo</h1>
    </div>
    <div class="email-body">
      <h2>Reset Your Password</h2>
      <p>Hey there,</p>
      <p>We received a request to reset your Echo password. To continue, simply click the button below and follow the instructions:</p>
      <div class="button-container">
        <a href="${resetURL}" class="button">Reset Password</a>
      </div>
      <p>This link will expire in 10 minutes. If it expires, you'll need to request a new password reset.</p>
      <div class="message-box">
        <p>If you didn't request this, feel free to ignore the email. Your account remains secure.</p>
      </div>
    </div>
    <div class="email-footer">
      <p>© 2025 Echo. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = createPasswordResetMessage; 