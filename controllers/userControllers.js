const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const { sendEmail } = require("../utils/nodeMailer");
const { sendToken } = require("../utils/sendToken");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Home Page
exports.homePage = catchAsyncErrors(async (req, res) => {
  res.status(200).json({ msg: "Welcome, API Is Working" });
});

// User Signup
exports.userSignup = catchAsyncErrors(async (req, res, next) => {
  const user = new User(req.body);
  await user.save();

  // Send verification email
  const verificationUrl = `${process.env.BASE_URL}/verify/${user._id}`;
  const mailOptions = {
    from: process.env.MAIL_ADDRESS,
    to: user.email,
    subject: "Account Verification",
    html: `
           <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Verification</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      p {
       margin-top: 5px;
        font-size: 16px;
        color: #666666;
      }
      .button {
        display: inline-block;
        padding: 12px 20px;
        font-size: 16px;
        color: #ffffff;
        background-color: #28a745;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
        margin-bottom: 15px;
        text-align: center;
        cursor: pointer;
      }
      .footer {
        text-align: left;
        margin-top: 20px;
        font-size: 12px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p>Hello, ${user.firstName}</p>
      <p>
        Thank you for signing up. Please click the button below to verify your
        account:
      </p>
      <a href="${verificationUrl}" class="button">Verify Account</a>
      <p>
        If the button above does not work, you can also verify your account by
        clicking the following link:
      </p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>Thank you,</p>
      <p>To-Let Globe</p>
      <div class="footer">
        <p>If you did not request this email, please ignore it.</p>
      </div>
    </div>
  </body>
</html>
        `,
  };

  try {
    await sendEmail(mailOptions);
    res.status(200).json({
      msg: "Registration successful, please check your email for verification",
    });
  } catch (error) {
    return next(new ErrorHandler("Error sending verification email", 500));
  }
});

// Account Verification
exports.verifyAccount = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("Invalid or expired token", 400));
    }

    if (user.isVerified) {
      return next(new ErrorHandler("Account is already verified", 400));
    }
    user.isVerified = true;
    await user.save();

    res.status(200).json({ msg: "Account verified successfully" });
  } catch (error) {
    return next(new ErrorHandler("Server error", 500));
  }
});

// User Signin
exports.userSignin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  if (!user.isVerified) {
    return next(new ErrorHandler("Please verify your account first", 403));
  }

  sendToken(user, 200, res);
});

// User Signout
exports.userSignout = catchAsyncErrors(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Successfully signed out!" });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new ErrorHandler("User not found with this email address", 404)
    );
  }

  // Generate reset token
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const mailOptions = {
    from: process.env.MAIL_ADDRESS,
    to: user.email,
    subject: "Password Reset Request",
    html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      p {
      margin-top: 5px;
        font-size: 16px;
        color: #666666;
      }
      .button {
        display: inline-block;
        padding: 12px 20px;
        font-size: 16px;
        color: #ffffff;
        background-color: #007bff;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
        margin-bottom: 15px;
        text-align: center;
        cursor: pointer;
      }
      .footer {
        text-align: left;
        margin-top: 20px;
        font-size: 12px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p>Hello, ${user.firstName}</p>
      <p>
        You recently requested to reset your password. Click the button below to
        reset it:
      </p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Thank you,</p>
      <p>To-Let Globe</p>
      <div class="footer">
        <p>If you did not request this email, please ignore it.</p>
      </div>
    </div>
  </body>
</html>
`,
  };

  try {
    await sendEmail(mailOptions);
    res.status(200).json({ msg: "Password reset link sent successfully" });
  } catch (error) {
    return next(new ErrorHandler("Error sending reset link", 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return next(new ErrorHandler("Invalid or expired token", 400));
    }

    // Hash and save the new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ msg: "Password has been reset successfully" });
  } catch (error) {
    return next(new ErrorHandler("Server error", 500));
  }
});
