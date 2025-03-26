import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  property: {
    type: Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  tenant: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Rental Period
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  months: { type: Number, required: true }, // Duration

  // Financials
  monthlyRent: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
  maintenanceFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  // Status
  status: {
    type: String,
    enum: ["Pending", "Approved", "Active", "Completed", "Cancelled"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending",
  },

  // Documents
  agreementUrl: { type: String }, // PDF contract
  paymentReceipts: [String], // Array of URLs

  // System
  createdAt: { type: Date, default: Date.now },
});

// Indexes
bookingSchema.index({ property: 1 });
bookingSchema.index({ tenant: 1 });
bookingSchema.index({ owner: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
