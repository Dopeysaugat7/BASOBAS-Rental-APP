import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: String, // Format: YYYY-MM
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentId: {
    type: String,
  },
  paymentType: {
    type: String,
    enum: ["initial", "monthly"],
    required: true,
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

paymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Payment = mongoose.model("Payment", paymentSchema);
