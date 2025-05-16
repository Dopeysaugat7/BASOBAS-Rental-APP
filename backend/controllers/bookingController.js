import { Booking } from "../models/bookingModel.js";
import { Property } from "../models/propertyModel.js";
import { User } from "../models/userModel.js";
import { Payment } from "../models/paymentModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { sendEmail } from "../utils/sendEmail.js";
import axios from "axios";
import crypto from "crypto";
import { endOfMonth, format } from "date-fns";
import winston from "winston";

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Format date helper
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Create a new booking and initiate eSewa payment
export const createBooking = catchAsyncError(async (req, res, next) => {
  const {
    propertyId,
    startDate,
    endDate,
    amount,
    paymentType,
    monthlyRent,
    securityDeposit,
  } = req.body;

  logger.info("Creating booking", { userId: req.user._id, propertyId });

  if (!propertyId || !startDate || !endDate || !amount || !monthlyRent) {
    return next(new ErrorHandler("All required fields must be provided", 400));
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  if (!property.isAvailable) {
    return next(new ErrorHandler("Property is not available", 400));
  }

  // Validate amount and breakdown
  const expectedAmount = monthlyRent + (securityDeposit || 0) + 120 + 75;
  if (amount !== expectedAmount) {
    return next(new ErrorHandler("Invalid payment amount", 400));
  }

  if (securityDeposit !== (property.securityDeposit || 0)) {
    return next(new ErrorHandler("Invalid security deposit amount", 400));
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
    start.getMonth() +
    1;
  if (months < property.minimumStayMonths) {
    return next(
      new ErrorHandler(
        `Minimum stay is ${property.minimumStayMonths} months`,
        400
      )
    );
  }

  const booking = await Booking.create({
    user: req.user._id,
    property: propertyId,
    startDate,
    endDate,
    totalAmount: amount,
    paymentType: paymentType || "initial",
    paymentBreakdown: {
      monthlyRent,
      securityDeposit: securityDeposit || 0,
      serviceFee: 120,
      cleaningFee: 75,
    },
  });

  // eSewa Payment Integration
  const esewaUrl = process.env.ESEWA_TEST_URL
    ? `${process.env.ESEWA_TEST_URL}/epay/main`
    : "https://rc.esewa.com.np/epay/main";
  const merchantId = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
  const successUrl = `${process.env.BACKEND_URL}/api/bookings/verify-payment`;
  const failureUrl = `${process.env.FRONTEND_URL}/booking/status?status=failed`;

  const paymentData = {
    amt: amount,
    psc: 0,
    pdc: 0,
    txAmt: 0,
    tAmt: amount,
    pid: booking._id.toString(),
    scd: merchantId,
    su: successUrl,
    fu: failureUrl,
  };

  const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
  const signatureString = `total_amount=${amount},transaction_uuid=${booking._id},product_code=${merchantId}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureString)
    .digest("base64");
  paymentData.signature = signature;

  // Create payment record
  await Payment.create({
    booking: booking._id,
    amount,
    month: format(start, "yyyy-MM"),
    paymentType: "initial",
    paymentId: booking._id.toString(),
  });

  logger.info("eSewa Payment Initiation", {
    esewaUrl,
    paymentData,
    signatureString,
    bookingId: booking._id,
  });

  res.status(200).json({
    success: true,
    message: "Booking created, redirect to eSewa for payment",
    paymentUrl: esewaUrl,
    paymentData,
  });
});

// Verify eSewa payment
export const verifyPayment = catchAsyncError(async (req, res, next) => {
  const { oid, amt, refId } = req.query;

  logger.info("Verifying payment", { oid, amt, refId });

  if (!oid || !amt) {
    return next(new ErrorHandler("Missing required query parameters", 400));
  }

  const booking = await Booking.findById(oid);
  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  if (parseFloat(amt).toFixed(2) !== booking.totalAmount.toFixed(2)) {
    logger.error("Amount mismatch", {
      queryAmt: parseFloat(amt).toFixed(2),
      bookingAmt: booking.totalAmount.toFixed(2),
    });
    booking.paymentStatus = "failed";
    booking.status = "cancelled";
    await booking.save();
    return res.redirect(`${process.env.FRONTEND_URL}/booking/failed`);
  }

  const payment = await Payment.findOne({
    booking: oid,
    paymentType: "initial",
  });
  if (!payment) {
    return next(new ErrorHandler("Payment record not found", 404));
  }

  if (
    process.env.NODE_ENV === "development" &&
    process.env.MOCK_ESEWA === "true"
  ) {
    booking.paymentStatus = "completed";
    booking.status = "confirmed";
    booking.paymentId = "mock-" + booking._id;
    payment.status = "completed";
    payment.paymentId = booking.paymentId;
    payment.paidAt = new Date();
    await booking.save();
    await payment.save();

    await updatePropertyAndUser(booking);
    await sendConfirmationEmails(booking);

    return res.redirect(
      `${process.env.FRONTEND_URL}/booking/success?bookingId=${booking._id}`
    );
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
      logger.info(`Attempt ${attempt}: Retrying in ${delayMs}ms...`, { oid });
      await delay(delayMs);
    } catch (error) {
      logger.error(`Attempt ${attempt} failed`, { error: error.message, oid });
      if (attempt === maxAttempts) {
        verificationResult = {
          status: "ERROR",
          message: "Max verification attempts reached",
        };
      }
    }
  }

  if (verificationResult.status === "SUCCESS") {
    booking.paymentStatus = "completed";
    booking.status = "confirmed";
    booking.paymentId =
      refId || verificationResult.transaction_code || `esewa-${Date.now()}`;
    payment.status = "completed";
    payment.paymentId = booking.paymentId;
    payment.paidAt = new Date();
    await booking.save();
    await payment.save();

    await updatePropertyAndUser(booking);
    await sendConfirmationEmails(booking);

    return res.redirect(
      `${process.env.FRONTEND_URL}/booking/success?bookingId=${booking._id}`
    );
  } else {
    logger.error("Payment verification failed", {
      result: verificationResult,
      oid,
    });
    booking.paymentStatus = "failed";
    booking.status = "cancelled";
    payment.status = "failed";
    await booking.save();
    await payment.save();

    return res.redirect(`${process.env.FRONTEND_URL}/booking/failed`);
  }
});

// Create monthly payment
export const createMonthlyPayment = catchAsyncError(async (req, res, next) => {
  const { bookingId, month, amount } = req.body;

  logger.info("Creating monthly payment", { bookingId, month, amount });

  if (!bookingId || !month || !amount) {
    return next(new ErrorHandler("All required fields must be provided", 400));
  }

  const booking = await Booking.findById(bookingId).populate("property");
  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  if (booking.status !== "confirmed") {
    return next(new ErrorHandler("Booking is not active", 400));
  }

  if (amount !== booking.paymentBreakdown.monthlyRent) {
    return next(new ErrorHandler("Invalid rent amount", 400));
  }

  // Check for existing payment
  const existingPayment = await Payment.findOne({
    booking: bookingId,
    month,
    status: "completed",
  });

  if (existingPayment) {
    return next(
      new ErrorHandler("Payment already completed for this month", 400)
    );
  }

  const payment = await Payment.create({
    booking: bookingId,
    amount,
    month,
    paymentType: "monthly",
    paymentId: `${bookingId}-${Date.now()}`,
  });

  const esewaUrl = process.env.ESEWA_TEST_URL
    ? `${process.env.ESEWA_TEST_URL}/epay/main`
    : "https://rc.esewa.com.np/epay/main";
  const merchantId = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
  const successUrl = `${process.env.BACKEND_URL}/api/bookings/verify-monthly-payment`;
  const failureUrl = `${process.env.FRONTEND_URL}/booking/failed`;

  const paymentData = {
    amt: amount,
    psc: 0,
    pdc: 0,
    txAmt: 0,
    tAmt: amount,
    pid: payment.paymentId,
    scd: merchantId,
    su: successUrl,
    fu: failureUrl,
  };

  const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
  const signatureString = `total_amount=${amount},transaction_uuid=${payment.paymentId},product_code=${merchantId}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(signatureString)
    .digest("base64");
  paymentData.signature = signature;

  await Booking.updateOne(
    { _id: bookingId },
    {
      $push: {
        monthlyPayments: {
          amount,
          month,
          status: "pending",
          paymentId: payment.paymentId,
        },
      },
    }
  );

  logger.info("eSewa Monthly Payment Initiation", {
    esewaUrl,
    paymentData,
    bookingId,
    paymentId: payment.paymentId,
  });

  res.status(200).json({
    success: true,
    message: "Redirect to eSewa for monthly payment",
    paymentUrl: esewaUrl,
    paymentData,
  });
});

// Verify monthly payment
export const verifyMonthlyPayment = catchAsyncError(async (req, res, next) => {
  const { oid, amt, refId } = req.query;

  logger.info("Verifying monthly payment", { oid, amt, refId });

  if (!oid || !amt) {
    return next(new ErrorHandler("Missing required query parameters", 400));
  }

  const payment = await Payment.findOne({ paymentId: oid });
  if (!payment) {
    return next(new ErrorHandler("Payment not found", 404));
  }

  const booking = await Booking.findById(payment.booking);
  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  if (parseFloat(amt).toFixed(2) !== payment.amount.toFixed(2)) {
    logger.error("Amount mismatch", {
      queryAmt: parseFloat(amt).toFixed(2),
      paymentAmt: payment.amount.toFixed(2),
    });
    payment.status = "failed";
    await payment.save();
    await Booking.updateOne(
      { _id: booking._id, "monthlyPayments.paymentId": oid },
      { $set: { "monthlyPayments.$.status": "failed" } }
    );
    return res.redirect(`${process.env.FRONTEND_URL}/booking/failed`);
  }

  if (
    process.env.NODE_ENV === "development" &&
    process.env.MOCK_ESEWA === "true"
  ) {
    payment.status = "completed";
    payment.paidAt = new Date();
    payment.paymentId = refId || `mock-${oid}`;
    await payment.save();
    await Booking.updateOne(
      { _id: booking._id, "monthlyPayments.paymentId": oid },
      {
        $set: {
          "monthlyPayments.$.status": "completed",
          "monthlyPayments.$.paidAt": new Date(),
          "monthlyPayments.$.paymentId": payment.paymentId,
        },
      }
    );

    return res.redirect(
      `${process.env.FRONTEND_URL}/booking/success?paymentId=${oid}`
    );
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
      logger.info(`Attempt ${attempt}: Retrying in ${delayMs}ms...`, { oid });
      await delay(delayMs);
    } catch (error) {
      logger.error(`Attempt ${attempt} failed`, { error: error.message, oid });
      if (attempt === maxAttempts) {
        verificationResult = {
          status: "ERROR",
          message: "Max verification attempts reached",
        };
      }
    }
  }

  if (verificationResult.status === "SUCCESS") {
    payment.status = "completed";
    payment.paidAt = new Date();
    payment.paymentId =
      refId || verificationResult.transaction_code || `esewa-${Date.now()}`;
    await payment.save();
    await Booking.updateOne(
      { _id: booking._id, "monthlyPayments.paymentId": oid },
      {
        $set: {
          "monthlyPayments.$.status": "completed",
          "monthlyPayments.$.paidAt": new Date(),
          "monthlyPayments.$.paymentId": payment.paymentId,
        },
      }
    );

    return res.redirect(
      `${process.env.FRONTEND_URL}/booking/success?paymentId=${oid}`
    );
  } else {
    logger.error("Monthly payment verification failed", {
      result: verificationResult,
      oid,
    });
    payment.status = "failed";
    await payment.save();
    await Booking.updateOne(
      { _id: booking._id, "monthlyPayments.paymentId": oid },
      { $set: { "monthlyPayments.$.status": "failed" } }
    );

    return res.redirect(`${process.env.FRONTEND_URL}/booking/failed`);
  }
});

// Check payment status
export const checkPaymentStatus = catchAsyncError(async (req, res, next) => {
  const { bookingId, month } = req.body;

  logger.info("Checking payment status", { bookingId, month });

  if (!bookingId || !month) {
    return next(new ErrorHandler("Booking ID and month are required", 400));
  }

  const payment = await Payment.findOne({
    booking: bookingId,
    month,
    status: "completed",
  });

  res.status(200).json({
    success: true,
    isPaid: !!payment,
  });
});

// Terminate a confirmed booking
export const terminateBooking = catchAsyncError(async (req, res, next) => {
  const { bookingId } = req.body;

  logger.info("Terminating booking", { bookingId, userId: req.user._id });

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

  const today = new Date();
  const endOfCurrentMonth = endOfMonth(today);
  const daysInMonth = endOfCurrentMonth.getDate();
  const daysUsed = today.getDate();
  const prorationFactor = (daysInMonth - daysUsed) / daysInMonth;

  const refundAmount =
    booking.paymentBreakdown.securityDeposit +
    booking.paymentBreakdown.monthlyRent * prorationFactor;

  booking.status = "cancelled";
  booking.endDate = endOfCurrentMonth;
  booking.refundedAmount = refundAmount;
  booking.paymentStatus = refundAmount > 0 ? "refunded" : booking.paymentStatus;
  await booking.save();

  const property = await Property.findById(booking.property._id);
  if (property) {
    property.isAvailable = true;
    property.isBooked = false;
    await property.save();
  }

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
      <li>Refund Amount: NPR ${refundAmount.toFixed(
        2
      )} (Security Deposit + Prorated Rent)</li>
    </ul>
    <p>The refund will be processed within 5-7 business days.</p>
  `;

  const hostMessage = `
    <p>Dear ${host.name},</p>
    <p>The booking for your property "${
      booking.property.title
    }" has been terminated.</p>
    <p>Details:</p>
    <ul>
      <li>Tenant: ${user.name}</li>
      <li>Booking ID: ${booking._id}</li>
      <li>Termination Date: ${formattedEndDate}</li>
      <li>Refund to Tenant: NPR ${refundAmount.toFixed(2)}</li>
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
    logger.error("Failed to send termination emails", {
      error: emailError.message,
    });
  }

  res.status(200).json({
    success: true,
    message: `Booking terminated successfully. Refund of NPR ${refundAmount.toFixed(
      2
    )} will be processed.`,
    booking,
  });
});

// Get user's bookings
export const getUserBookings = catchAsyncError(async (req, res, next) => {
  logger.info("Fetching user bookings", { userId: req.user._id });

  const bookings = await Booking.find({ user: req.user._id })
    .populate("property", "title images address")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// Get booking status
export const getBookingStatus = catchAsyncError(async (req, res, next) => {
  const { bookingId } = req.params;

  logger.info("Fetching booking status", { bookingId, userId: req.user._id });

  const booking = await Booking.findById(bookingId)
    .populate("property", "title address")
    .select(
      "status paymentStatus totalAmount startDate endDate paymentBreakdown monthlyPayments"
    );

  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  res.status(200).json({
    success: true,
    data: booking,
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
    $push: {
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
    logger.error("Property or User not found for email sending", {
      bookingId: booking._id,
    });
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
      <li>Total Initial Amount: NPR ${booking.totalAmount}</li>
      <li>Monthly Rent: NPR ${booking.paymentBreakdown.monthlyRent}</li>
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
      <li>Total Initial Amount: NPR ${booking.totalAmount}</li>
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
    logger.error("Failed to send confirmation emails", {
      error: emailError.message,
    });
  }
}

async function verifyWithStatusAPI(config, oid, amt) {
  const url = `${config.baseUrl}${config.statusUrl}`;
  const params = {
    product_code: config.merchantId,
    total_amount: parseFloat(amt).toFixed(2),
    transaction_uuid: oid,
  };

  logger.info("Checking transaction status via Status API", { url, params });
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

  logger.info("Falling back to legacy verification", { url, params });
  const response = await axios.get(url, { params, timeout: 10000 });

  return {
    status: response.data.includes("Success") ? "SUCCESS" : "NOT_FOUND",
    transaction_code: refId,
  };
}
