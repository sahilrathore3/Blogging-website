const { sendMail } = require("./nodeMailerHelperFunction");

// OTP Email
exports.sendOTPEmail = async (email, username, otpCode) => {
    const subject = "Verify Your Account";

    const content = `
    <div style="font-family: Arial, sans-serif;">
      <h2>OTP Verification</h2>
      <p>Your OTP is:</p>
      <h1 style="color: #2563eb;">${otpCode}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    </div>
  `;

    return await sendMail({ email, subject, content });
};

// Email Verification Success 
exports.sendWelcomeEmail = async (email ) => {
    const subject = "Account Verified 🎉";

    const content = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Welcome!</h2>
      <p>Your account has been successfully verified.</p>
    </div>
  `;

    return await sendMail({ email, subject, content });
};

// Reset Password Email
exports.sendResetPasswordEmail = async (email, otp) => {
    const subject = "Reset Your Password";

    const content = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Password Reset</h2>
      <p>Use the OTP below to reset your password:</p>
      <h1 style="color: #dc3545;">${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    </div>
  `;

    return await sendMail({ email, subject, content });
};
