import mongoose from "mongoose";

const visitSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  visitorName: {
    type: String,
    required: true,
  },
  visitorEmail: {
    type: String,
    required: true,
  },
  visitorPhone: {
    type: String,
    required: true,
  },
  visitDate: {
    type: Date,
    required: true,
  },
  message: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  statusHistory: [
    {
      status: String,
      changedAt: {
        type: Date,
        default: Date.now,
      },
      notes: String,
    },
  ],
  confirmationEmailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Visit = mongoose.model("Visit", visitSchema);
