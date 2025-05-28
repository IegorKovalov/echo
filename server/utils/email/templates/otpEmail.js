const otpEmailTemplate = (otp, userName) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Your Verification Code</title>
    <style>
      .container {
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 5px;
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #f0f0f0;
      }
      .content {
        padding: 20px 0;
        line-height: 1.5;
      }
      .otp-box {
        background-color: #f9f9f9;
        border: 1px solid #e0e0e0;
        border-radius: 5px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 5px;
      }
      .footer {
        font-size: 12px;
        color: #777;
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Email Verification</h2>
      </div>
      <div class="content">
        <p>Hello ${userName},</p>
        <p>Thank you for signing up. To complete your registration, please enter the verification code below:</p>
        <div class="otp-box">${otp}</div>
        <p>This code is valid for 10 minutes and can only be used once. Please do not share this code with anyone for security reasons.</p>
        <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
      </div>
      <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} Echo. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = otpEmailTemplate; 