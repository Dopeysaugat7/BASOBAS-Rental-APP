import { Booking } from "../models/bookingModel.js";
import { Payment } from "../models/paymentModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import axios from "axios";
import crypto from "crypto";

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Create a new payment for monthly rent
export const createPayment = catchAsyncError(async (req, res, next) => {
  const { bookingId, month, amount } = req.body;

  if (!bookingId || !month || !amount) {
    return next(
      new ErrorHandler("Booking ID, month, and amount are required", 400)
    );
  }

  // Validate month format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return next(new ErrorHandler("Invalid month format. Use YYYY-MM", 400));
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new ErrorHandler("Booking not found", 404));
  }

  if (booking.status !== "confirmed") {
    return next(new ErrorHandler("Booking is not confirmed", 400));
  }

  const existingPayment = await Payment.findOne({ booking: bookingId, month });
  if (existingPayment && existingPayment.status === "completed") {
    return next(
      new ErrorHandler(`Payment for ${month} already completed`, 400)
    );
  }

  let payment;
  if (existingPayment) {
    payment = existingPayment;
    payment.amount = amount;
    payment.status = "pending";
  } else {
    payment = await Payment.create({
      booking: bookingId,
      month,
      amount,
      status: "pending",
    });
  }

  const esewaUrl = process.env.ESEWA_TEST_URL
    ? `${process.env.ESEWA_TEST_URL}/epay/main`
    : "https://rc.esewa.com.np/epay/main";
  const merchantId = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
  const successUrl = `${process.env.BACKEND_URL}/api/payments/verify`;
  const failureUrl = `${process.env.FRONTEND_URL}/booking/status?status=failed`;

  const paymentData = {
    amt: amount,
    psc: 0,
    pdc: 0,
    txAmt: 0,
    tAmt: amount,
    pid: payment._id.toString(),
    scd: merchantId,
    su: successUrl,
    fu: failureUrl,
  };

  const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
  const signatureString = `total_amount=${amount},transaction_uuid=${payment._id},product_code=${merchantId}`;
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
    bookingId,
    bookingDates: { startDate: booking.startDate, endDate: booking.endDate },
  });

  await payment.save();

  res.status(200).json({
    success: true,
    message: "Redirect to eSewa for payment",
    paymentUrl: esewaUrl,
    paymentData,
  });
});

// Verify eSewa payment using transaction status API and legacy fallback
export const verifyPayment = catchAsyncError(async (req, res, next) => {
  console.log("verifyPayment endpoint hit with query:", req.query);

  const { oid, amt, refId } = req.query;

  if (!oid || !amt) {
    return next(new ErrorHandler("Missing required query parameters", 400));
  }

  const payment = await Payment.findById(oid);
  if (!payment) {
    return next(new ErrorHandler("Payment not found", 404));
  }

  if (parseFloat(amt).toFixed(2) !== payment.amount.toFixed(2)) {
    console.log("Amount mismatch:", {
      queryAmt: parseFloat(amt).toFixed(2),
      paymentAmt: payment.amount.toFixed(2),
    });
    payment.status = "failed";
    await payment.save();
    return res.redirect(
      `${process.env.FRONTEND_URL}/booking/status?paymentId=${payment._id}&status=failed`
    );
  }

  if (
    process.env.NODE_ENV === "development" &&
    process.env.MOCK_ESEWA === "true"
  ) {
    payment.status = "completed";
    payment.paymentId = `mock-${payment._id}`;
    await payment.save();
    console.log("Mock payment completed for payment:", payment._id);
    return res.redirect(
      `${process.env.FRONTEND_URL}/booking/status?paymentId=${payment._id}&status=success`
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

  return processVerificationResult(verificationResult, payment, refId, res);
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

async function processVerificationResult(result, payment, refId, res) {
  console.log("Final verification result:", result);

  if (result.status === "SUCCESS") {
    payment.status = "completed";
    payment.paymentId =
      refId || result.transaction_code || `esewa-${Date.now()}`;
    await payment.save();
    console.log("Payment completed for payment:", payment._id);
    return res.redirect(
      `${process.env.FRONTEND_URL}/booking/success?paymentId=${payment._id}`
    );
  } else {
    payment.status = "failed";
    await payment.save();
    console.log("Payment verification failed:", result.message);
    return res.redirect(`${process.env.FRONTEND_URL}/booking/failed`);
  }
}

// Get user's payments
export const getUserPayments = catchAsyncError(async (req, res, next) => {
  const payments = await Payment.find({
    booking: {
      $in: await Booking.find({ user: req.user._id }).distinct("_id"),
    },
  })
    .populate("booking", "property")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments,
  });
});

// Payment Check API
export const checkPayment = catchAsyncError(async (req, res, next) => {
  const { bookingId, month } = req.body;

  if (!bookingId || !month) {
    return next(new ErrorHandler("Booking ID and month are required", 400));
  }

  console.log("Checking payment:", { bookingId, month });
  const existingPayment = await Payment.findOne({
    booking: bookingId,
    month,
    status: "completed",
  });

  console.log("Existing Payment:", !existingPayment);

  res.status(200).json({ isPaid: !!existingPayment });
});
