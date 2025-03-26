import mongoose from "mongoose";

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "BookingRequest",
      "BookingConfirmed",
      "PaymentReceived",
      "NewMessage",
      "ReviewReceived",
    ],
    required: true,
  },
  message: { type: String, required: true },
  relatedProperty: { type: Schema.Types.ObjectId, ref: "Property" },
  relatedBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Indexes
notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });

export const Notification = mongoose.model("Notification", notificationSchema);
