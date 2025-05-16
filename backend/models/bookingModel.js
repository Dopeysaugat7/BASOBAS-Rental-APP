import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  paymentType: {
    type: String,
    enum: ["initial", "monthly", "other"],
    default: "initial",
  },
  paymentBreakdown: {
    monthlyRent: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 120 },
    cleaningFee: { type: Number, default: 75 },
  },
  monthlyPayments: [
    {
      amount: { type: Number, required: true },
      month: { type: String, required: true }, // Format: YYYY-MM
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      paymentId: String,
      paidAt: Date,
    },
  ],
  refundedAmount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Booking = mongoose.model("Booking", bookingSchema);
