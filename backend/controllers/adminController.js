import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { SuperAdmin } from "../models/adminModel.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { authenticator } from "otplib";
import crypto from "crypto";

// Register a new superadmin
export const registerSuperAdmin = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password, phone, allowedIPs } = req.body;

    // Check if the superadmin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({
      $or: [
        { email, accountVerified: true },
        { phone, accountVerified: true },
      ],
    });
    if (existingSuperAdmin) {
      return next(new ErrorHandler("SuperAdmin already exists", 400));
    }

    // Ensure allowedIPs is provided
    if (!allowedIPs || !Array.isArray(allowedIPs) || allowedIPs.length === 0) {
      return next(
        new ErrorHandler("At least one allowed IP address is required", 400)
      );
    }

    // Create a new superadmin
    const superAdmin = await SuperAdmin.create({
      name,
      email,
      phone,
      password,
      allowedIPs,
    });

    const verificationCode = superAdmin.generateVerificationCode();
    await superAdmin.save();

    // Pass the `res` object correctly
    await sendverificationCode(verificationCode, name, email, res);
  } catch (error) {
    return next(error);
  }
});

async function sendverificationCode(verificationCode, name, email, res) {
  try {
    const message = generateEmailTemplate(verificationCode);
    await sendEmail(email, "Your Verification Code", message);
    res.status(200).json({
      success: true,
      message: `Verification email sent to ${name}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Verification email failed to send",
      error: error.message,
    });
  }
}

function generateEmailTemplate(verificationCode) {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
        <p style="font-size: 16px; color: #333;">Dear User,</p>
        <p style="font-size: 16px; color: #333;">Your verification code is:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
            ${verificationCode}
          </span>
        </div>
        <p style="font-size: 16px; color: #333;">Please use this code to verify your account. The code will expire in 15 minutes.</p>
        <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
        <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
          <p>Thank you,<br>Your Company Team</p>
          <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
        </footer>
      </div>
    `;
}

export const verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp, phone } = req.body;

  // Validate phone number
  function validatePhoneNumber(phone) {
    const phoneRegex = /^(?:\+977[-\s]?)?(9[78]\d{8})$/;
    return phoneRegex.test(phone);
  }

  if (!validatePhoneNumber(phone)) {
    return next(new ErrorHandler("Invalid phone number", 400));
  }

  try {
    // Find all entries for the superadmin with the given email or phone
    const superAdminAllEntries = await SuperAdmin.find({
      $or: [
        { email, accountVerified: false },
        { phone, accountVerified: false },
      ],
    }).sort({ createdAt: -1 });

    if (!superAdminAllEntries || superAdminAllEntries.length === 0) {
      return next(new ErrorHandler("SuperAdmin not found", 404));
    }

    let superAdmin;

    // If there are multiple entries, delete duplicates and keep the latest one
    if (superAdminAllEntries.length > 1) {
      superAdmin = superAdminAllEntries[0];

      await SuperAdmin.deleteMany({
        _id: { $ne: superAdmin._id },
        $or: [
          { email, accountVerified: false },
          { phone, accountVerified: false },
        ],
      });
    } else {
      superAdmin = superAdminAllEntries[0];
    }

    // Check if the OTP matches
    if (superAdmin.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    // Check if the OTP has expired
    const currentTime = Date.now();
    const verificationCodeExpire = new Date(
      superAdmin.verificationCodeExpire
    ).getTime();

    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP has expired", 400));
    }

    // Mark the account as verified and clear the verification code
    superAdmin.accountVerified = true;
    superAdmin.verificationCode = undefined;
    superAdmin.verificationCodeExpire = undefined;

    await superAdmin.save({ validateBeforeSave: false });

    // Send token to the client
    sendToken(superAdmin, 200, "Account Verified Successfully", res);
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

// Login superadmin
export const loginSuperAdmin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  // Find the superadmin by email
  const superAdmin = await SuperAdmin.findOne({ email }).select("+password");
  if (!superAdmin) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Verify password
  const isPasswordMatched = await superAdmin.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Send token (JWT) to the client
  sendToken(superAdmin, 200, "SuperAdmin logged in successfully", res);
});

// Get superadmin dashboard
export const getSuperAdminDashboard = catchAsyncError(
  async (req, res, next) => {
    const stats = await SuperAdmin.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "SuperAdmin dashboard accessed successfully",
      stats,
    });
  }
);

// Update allowed IPs for superadmin
export const updateAllowedIPs = catchAsyncError(async (req, res, next) => {
  const { allowedIPs } = req.body;
  const superAdmin = req.user;

  // Ensure allowedIPs is provided
  if (!allowedIPs || !Array.isArray(allowedIPs) || allowedIPs.length === 0) {
    return next(
      new ErrorHandler("At least one allowed IP address is required", 400)
    );
  }

  // Update the allowedIPs list
  superAdmin.allowedIPs = allowedIPs;
  await superAdmin.save();

  res.status(200).json({
    success: true,
    message: "Allowed IPs updated successfully",
    superAdmin,
  });
});

// Logout superadmin
export const logoutSuperAdmin = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true, // Enable in production (HTTPS)
    })
    .json({
      success: true,
      message: "SuperAdmin logged out successfully",
    });
});

// Forgot password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const superAdmin = await SuperAdmin.findOne({ email });

  if (!superAdmin) {
    return next(new ErrorHandler("SuperAdmin not found", 404));
  }

  const resetToken = superAdmin.generateResetPasswordToken();
  await superAdmin.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `Your password reset token is as follows:\n\n ${resetPasswordUrl} \n\n If you have not requested this email, please ignore it.`;

  try {
    await sendEmail(email, "Password Reset Request", message);

    res.status(200).json({
      success: true,
      message: `Email sent to ${email} successfully`,
    });
  } catch (error) {
    superAdmin.resetPasswordToken = undefined;
    superAdmin.resetPasswordExpire = undefined;
    await superAdmin.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

// Reset password
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const superAdmin = await SuperAdmin.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!superAdmin) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }

  superAdmin.password = password;
  superAdmin.resetPasswordToken = undefined;
  superAdmin.resetPasswordExpire = undefined;
  await superAdmin.save();

  sendToken(superAdmin, 200, "Password Reset Successfully", res);
});
