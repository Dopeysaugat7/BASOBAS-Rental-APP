import { Booking } from "../models/bookingModel.js";
import { Property } from "../models/propertyModel.js";
import { User } from "../models/userModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { sendEmail } from "../utils/sendEmail.js";
import axios from "axios";
import crypto from "crypto";
import { endOfMonth, format } from "date-fns";

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Create a new booking and initiate eSewa payment
export const createBooking = catchAsyncError(async (req, res, next) => {
  const { propertyId, startDate, endDate } = req.body;

  if (!propertyId || !startDate || !endDate) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  if (!property.isAvailable) {
    return next(new ErrorHandler("Property is not available", 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today || end <= start) {
    return next(new ErrorHandler("Invalid booking dates", 400));
  }

  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth();
  if (months < property.minimumStayMonths) {
    return next(
      new ErrorHandler(
        `Minimum stay is ${property.minimumStayMonths} months`,
        400
      )
    );
  }

  const totalAmount =
    property.pricePerMonth * months + (property.securityDeposit || 0) + 195; // Service fee ($120) + Cleaning fee ($75)

  const booking = await Booking.create({
    user: req.user._id,
    property: propertyId,
    startDate,
    endDate,
    totalAmount,
  });

  // eSewa Payment Integration
  const esewaUrl = process.env.ESEWA_TEST_URL
    ? `${process.env.ESEWA_TEST_URL}/epay/main`
    : "https://rc.esewa.com.np/epay/main";
  const merchantId = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
  const successUrl = `${process.env.BACKEND_URL}/api/bookings/verify-payment`;
  const failureUrl = `${process.env.FRONTEND_URL}/booking/status?status=failed`;

  const paymentData = {
    amt: totalAmount,
    psc: 0,
    pdc: 0,
    txAmt: 0,
    tAmt: totalAmount,
    pid: booking._id.toString(),
    scd: merchantId,
    su: successUrl,
    fu: failureUrl,
  };

  const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
  const signatureString = `total_amount=${totalAmount},transaction_uuid=${booking._id},product_code=${merchantId}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureString)
    .digest("base64");
  paymentData.signature = signature;

  console.log("eSewa Payment Initiation:", {
    esewaUrl,
    paymentData,
    signatureString,
    signature,
    successUrl,
    failureUrl,
  });

  res.status(200).json({
    success: true,
    message: "Booking created, redirect to eSewa for payment",
    paymentUrl: esewaUrl,
    paymentData,
  });
});

// Terminate a confirmed booking
export const terminateBooking = catchAsyncError(async (req, res, next) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return next(new ErrorHandler("Booking ID is required", 400));
  }

  const booking = await Booking.findById(bookingId).populate("property");
  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("Unauthorized to terminate this booking", 403)
    );
  }

  if (booking.status !== "confirmed") {
    return next(
      new ErrorHandler("Only confirmed bookings can be terminated", 400)
    );
  }

  // Update booking: set status to cancelled, endDate to end of current month
  booking.status = "cancelled";
  booking.endDate = endOfMonth(new Date());
  await booking.save();

  // Update property: make available
  const property = await Property.findById(booking.property._id);
  if (property) {
    property.isAvailable = true;
    property.isBooked = false;
    await property.save();
  }

  // Send emails to user and host
  const user = await User.findById(booking.user);
  const host = await User.findById(booking.property.host);
  const formattedEndDate = formatDate(booking.endDate);

  const userMessage = `
    <p>Dear ${user.name},</p>
    <p>Your booking for ${booking.property.title} has been terminated.</p>
    <p>Details:</p>
    <ul>
      <li>Booking ID: ${booking._id}</li>
      <li>Property: ${booking.property.title}</li>
      <li>Termination Date: ${formattedEndDate}</li>
    </ul>
    <p>Thank you for using our platform.</p>
  `;

  const hostMessage = `
    <p>Dear ${host.name},</p>
    <p>The booking for your property "${booking.property.title}" has been terminated.</p>
    <p>Details:</p>
    <ul>
      <li>Tenant: ${user.name}</li>
      <li>Booking ID: ${booking._id}</li>
      <li>Termination Date: ${formattedEndDate}</li>
    </ul>
    <p>Your property is now available for new bookings.</p>
  `;

  try {
    await sendEmail(
      user.email,
      "Booking Termination Confirmation",
      userMessage
    );
    await sendEmail(
      host.email,
      "Booking Termination Notification",
      hostMessage
    );
  } catch (emailError) {
    console.error("Failed to send termination emails:", emailError);
  }

  res.status(200).json({
    success: true,
    message: "Booking terminated successfully",
    booking,
  });
});

// Helper Functions
async function updatePropertyAndUser(booking) {
  const property = await Property.findById(booking.property);
  if (property) {
    property.isAvailable = false;
    property.bookings.push(booking._id);
    property.isBooked = true;
    await property.save();
  }

  await User.findByIdAndUpdate(booking.user, {
    $PUSH: {
      rentedProperties: {
        property: booking.property,
        startDate: booking.startDate,
        endDate: booking.endDate,
      },
    },
  });
}

async function sendConfirmationEmails(booking) {
  const property = await Property.findById(booking.property).populate("host");
  const user = await User.findById(booking.user);

  if (!property || !user) {
    console.error("Property or User not found for email sending");
    return;
  }

  const formattedStartDate = formatDate(booking.startDate);
  const formattedEndDate = formatDate(booking.endDate);

  const userMessage = `
    <p>Dear ${user.name},</p>
    <p>Your booking for ${property.title} has been confirmed!</p>
    <p>Details:</p>
    <ul>
      <li>Check-in: ${formattedStartDate}</li>
      <li>Check-out: ${formattedEndDate}</li>
      <li>Total Amount: NPR ${booking.totalAmount}</li>
    </ul>
    <p>Thank you for choosing our platform!</p>
  `;

  const hostMessage = `
    <p>Dear ${property.host.name},</p>
    <p>Your property "${property.title}" has been booked!</p>
    <p>Details:</p>
    <ul>
      <li>Tenant: ${user.name}</li>
      <li>Check-in: ${formattedStartDate}</li>
      <li>Check-out: ${formattedEndDate}</li>
      <li>Total Amount: NPR ${booking.totalAmount}</li>
    </ul>
  `;

  try {
    await sendEmail(user.email, "Booking Confirmation", userMessage);
    await sendEmail(
      property.host.email,
      "New Booking Notification",
      hostMessage
    );
  } catch (emailError) {
    console.error("Failed to send confirmation emails:", emailError);
  }
}

async function handleMockPayment(booking, res) {
  console.log("Mocking eSewa success response for booking:", booking._id);

  booking.paymentStatus = "completed";
  booking.status = "confirmed";
  booking.paymentId = "mock-" + booking._id;
  await booking.save();

  await updatePropertyAndUser(booking);
  await sendConfirmationEmails(booking);

  return res.redirect(
    `${process.env.FRONTEND_URL}/booking/status?bookingId=${booking._id}&status=success`
  );
}

// Verify eSewa payment using transaction status API
export const verifyPayment = catchAsyncError(async (req, res, next) => {
  console.log("verifyPayment endpoint hit with query:", req.query);

  const { oid, amt, refId } = req.query;

  if (!oid || !amt) {
    return next(new ErrorHandler("Missing required query parameters", 400));
  }

  const booking = await Booking.findById(oid);
  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  if (parseFloat(amt).toFixed(2) !== booking.totalAmount.toFixed(2)) {
    console.log("Amount mismatch:", {
      queryAmt: parseFloat(amt).toFixed(2),
      bookingAmt: booking.totalAmount.toFixed(2),
    });
    booking.paymentStatus = "failed";
    booking.status = "cancelled";
    await booking.save();
    return res.redirect(
      `${process.env.FRONTEND_URL}/booking/status?bookingId=${booking._id}&status=failed`
    );
  }

  if (
    process.env.NODE_ENV === "development" &&
    process.env.MOCK_ESEWA === "true"
  ) {
    return handleMockPayment(booking, res);
  }

  const esewaConfig = {
    baseUrl: process.env.ESEWA_TEST_URL || "https://rc.esewa.com.np",
    merchantId: process.env.ESEWA_MERCHANT_ID || "EPAYTEST",
    statusUrl: "/api/epay/transaction/status",
    directVerifyUrl: "/epay/transrec",
  };

  let verificationResult;
  const maxAttempts = 5;
  const initialDelay = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      verificationResult = await verifyWithStatusAPI(esewaConfig, oid, amt);

      if (verificationResult.status === "NOT_FOUND" && attempt > 2) {
        verificationResult = await verifyWithLegacyAPI(
          esewaConfig,
          oid,
          amt,
          refId
        );
      }

      if (verificationResult.status !== "NOT_FOUND") {
        break;
      }

      const delayMs = initialDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt}: Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxAttempts) {
        verificationResult = {
          status: "ERROR",
          message: "Max verification attempts reached",
        };
      }
    }
  }

  return processVerificationResult(verificationResult, booking, refId, res);
});

// Helper Functions
async function verifyWithStatusAPI(config, oid, amt) {
  const url = `${config.baseUrl}${config.statusUrl}`;
  const params = {
    product_code: config.merchantId,
    total_amount: parseFloat(amt).toFixed(2),
    transaction_uuid: oid,
  };

  console.log("Checking transaction status via Status API:", { url, params });
  const response = await axios.get(url, { params, timeout: 10000 });
  return response.data;
}

async function verifyWithLegacyAPI(config, oid, amt, refId) {
  const url = `${config.baseUrl}${config.directVerifyUrl}`;
  const params = {
    amt: amt,
    scd: config.merchantId,
    pid: oid,
    rid: refId || oid,
  };

  console.log("Falling back to legacy verification:", { url, params });
  const response = await axios.get(url, { params, timeout: 10000 });

  return {
    status: response.data.includes("Success") ? "SUCCESS" : "NOT_FOUND",
    transaction_code: refId,
  };
}

async function processVerificationResult(result, booking, refId, res) {
  console.log("Final verification result:", result);

  if (result.status === "SUCCESS") {
    booking.paymentStatus = "completed";
    booking.status = "confirmed";
    booking.paymentId =
      refId || result.transaction_code || `esewa-${Date.now()}`;
    await booking.save();

    await updatePropertyAndUser(booking);
    await sendConfirmationEmails(booking);

    return res.redirect(
      `${process.env.FRONTEND_URL}/booking/success?bookingId=${booking._id}`
    );
  } else {
    console.log("Payment verification failed:", result.message);
    booking.paymentStatus = "failed";
    booking.status = "cancelled";
    await booking.save();

    return res.redirect(`${process.env.FRONTEND_URL}/booking/failed`);
  }
}

// Get user's bookings
export const getUserBookings = catchAsyncError(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("property", "title images address")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// Helper function to format date
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
