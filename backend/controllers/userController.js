import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import { uploadProfilePicture } from "../utils/multer.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

let client;

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password, phone, verificationMethod } = req.body;
    if (!name || !email || !password || !phone || !verificationMethod) {
      return next(new ErrorHandler("All fields are required", 400));
    }
    function validatePhoneNumber(phone) {
      const phoneRegex = /^(?:\+977[-\s]?)?(9[78]\d{8})$/;
      return phoneRegex.test(phone);
    }

    if (!validatePhoneNumber(phone)) {
      return next(new ErrorHandler("Invalid phone number", 400));
    }

    const existingUser = await User.findOne({
      $or: [
        { email, accountVerified: true },
        { phone, accountVerified: true },
      ],
    });

    if (existingUser) {
      return next(
        new ErrorHandler(
          "User already exists with this email or phone number",
          400
        )
      );
    }

    const registerationAttemptsByUser = await User.find({
      $or: [
        { email, accountVerified: false },
        { phone, accountVerified: false },
      ],
    });

    if (registerationAttemptsByUser.length > 1) {
      return next(
        new ErrorHandler(
          "Too many registration attempts (2), try again after an hour",
          400
        )
      );
    }

    const userData = {
      name,
      email,
      password,
      phone,
    };

    const user = await User.create(userData);

    // const verificationCode = await user.generateVerificationCode();
    await user.save();

    // sendverificationCode(
    //   verificationMethod,
    //   verificationCode,
    //   name,
    //   email,
    //   phone,
    //   res
    // );
    sendToken(user, 201, "Registration successful", res);
  } catch (error) {
    next(error);
  }
});

export const sendVerification = catchAsyncError(async (req, res, next) => {
  const { email, phone, verificationMethod } = req.body;

  if (!email || !phone || !verificationMethod) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const user = await User.findOne({
    $or: [{ email }, { phone }],
    accountVerified: false,
  });

  if (!user) {
    return next(new ErrorHandler("User not found or already verified", 404));
  }

  const verificationCode = await user.generateVerificationCode();
  await user.save();

  await sendverificationCode(
    verificationMethod,
    verificationCode,
    user.name,
    email,
    phone,
    res
  );
});

export const resendVerification = catchAsyncError(async (req, res, next) => {
  const { method } = req.body;
  const user = await User.findById(req.user._id);

  if (user.accountVerified) {
    return next(new ErrorHandler("Account already verified", 400));
  }

  const verificationCode = await user.generateVerificationCode();
  await user.save();

  // Reuse your existing sendVerificationCode function
  await sendverificationCode(
    method || user.verificationMethod,
    verificationCode,
    user.name,
    user.email,
    user.phone,
    res
  );
});

async function sendverificationCode(
  verificationMethod,
  verificationCode,
  name,
  email,
  phone,
  res
) {
  try {
    if (verificationMethod.trim().toLowerCase() === "email") {
      // Send email verification code
      const message = generateEmailTemplate(verificationCode);

      sendEmail(email, "Your Verification Code", message);
      res.status(200).json({
        success: true,
        message: `Verification email sent to ${name}`,
      });
    } else if (verificationMethod.trim().toLowerCase() === "phone") {
      // Send phone verification code
      const verificationCodeWithSpaces = verificationCode
        .toString()
        .split("")
        .join(" ");

      // Initializing client
      try {
        if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN) {
          console.error("Missing Twilio credentials in environment variables");
        } else {
          client = twilio(
            process.env.TWILIO_SID,
            process.env.TWILIO_AUTH_TOKEN
          );
          console.log("Twilio client initialized successfully");
        }
      } catch (error) {
        console.error("Error initializing Twilio client:", error);
      }

      // In your phone verification condition
      if (!client) {
        console.error("Twilio client is not initialized");
        return res.status(500).json({
          success: false,
          message: "SMS service is not available",
          error: "Twilio client not initialized",
        });
      }

      await client.messages.create({
        body: `Hello! Your code is ${verificationCodeWithSpaces}.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });

      res.status(200).json({
        success: true,
        message: `OTP sent to ${phone}`,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Invalid verification method",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Verification code failed to send",
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
      <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 10 minutes.</p>
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
  function validatePhoneNumber(phone) {
    const phoneRegex = /^(?:\+977[-\s]?)?(9[78]\d{8})$/;
    return phoneRegex.test(phone);
  }

  if (!validatePhoneNumber(phone)) {
    return next(new ErrorHandler("Invalid phone number", 400));
  }

  try {
    const userAllEntries = await User.find({
      $or: [
        { email, accountVerified: false },
        { phone, accountVerified: false },
      ],
    }).sort({ createdAt: -1 });

    if (!userAllEntries) {
      return next(new ErrorHandler("User not found", 404));
    }

    let user;

    if (userAllEntries.length > 1) {
      user = userAllEntries[0];

      await User.deleteMany({
        _id: { $ne: user._id },
        $or: [
          { email, accountVerified: false },
          { phone, accountVerified: false },
        ],
      });
    } else {
      user = userAllEntries[0];
    }

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    const currentTime = Date.now();
    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();

    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP has expired", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;

    await user.save({ validateModifiedOnly: true });

    sendToken(user, 200, "Account Verified Successfully", res);
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email, accountVerified: true }).select(
    "+password"
  );

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }
  sendToken(user, 200, "User Logged in Successfully", res);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
    })
    .json({ success: true, message: "User Logged out Successfully" });
});

export const getUser = catchAsyncError(async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.generateResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}password/reset/${resetToken}`;

  const message = `Your password reset token is as follows:\n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it.`;

  try {
    await sendEmail(user.email, "Password Reset Request", message);

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler(
        error.message ? error.message : "Email could not be sent",
        500
      )
    );
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Password reset token is invalid or has expired", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, "Password Reset Successfully", res);
});

// Middleware to handle profile picture upload
export const uploadUserPhoto = uploadProfilePicture;

// Update User Profile (with file upload support)
export const updateUser = catchAsyncError(async (req, res, next) => {
  try {
    // Process file upload first
    let profilePicturePath;
    if (req.file) {
      profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;

      // Delete old profile picture if exists
      const user = await User.findById(req.user._id);
      if (user.profilePicture && user.profilePicture !== "default-image.svg") {
        const oldPath = path.join(process.cwd(), user.profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const updates = {
      ...req.body,
      ...(profilePicturePath && { profilePicture: profilePicturePath }),
    };

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    // Clean up uploaded file if error occurred
    if (req.file) {
      const filePath = path.join(
        process.cwd(),
        "uploads/profile-pictures",
        req.file.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
});

// Delete User Account (with profile picture cleanup)
export const deleteUser = catchAsyncError(async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Delete profile picture if it exists and isn't the default
    if (user.profilePicture && user.profilePicture !== "default-image.svg") {
      const imagePath = path.join(
        process.cwd(),
        "uploads/profile-pictures",
        path.basename(user.profilePicture)
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Use deleteOne() or findByIdAndDelete() instead of remove()
    await User.deleteOne({ _id: req.user._id });

    // Alternative: await user.deleteOne();

    // Clear cookie if using cookie-based auth
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return next(new ErrorHandler("Failed to delete user account", 500));
  }
});

// Change user password
export const changePassword = catchAsyncError(async (req, res, next) => {
  // 1. Properly destructure the request body
  const { currentPassword, newPassword } = req.body;

  // 2. Add validation for empty strings
  if (!currentPassword?.trim() || !newPassword?.trim()) {
    return next(
      new ErrorHandler("Both current and new passwords are required", 400)
    );
  }

  // 3. Find user with password field
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // 4. Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Current password is incorrect", 401));
  }

  // 5. Validate new password
  if (newPassword.length < 8) {
    return next(
      new ErrorHandler("Password must be at least 8 characters", 400)
    );
  }

  // 6. Update password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // 7. Send success response
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});
