import mongoose from "mongoose";

const Schema = mongoose.Schema;
const reviewSchema = new Schema({
  property: {
    type: Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },

  // Ratings (1-5)
  overall: { type: Number, min: 1, max: 5, required: true },
  cleanliness: { type: Number, min: 1, max: 5 },
  amenities: { type: Number, min: 1, max: 5 },
  location: { type: Number, min: 1, max: 5 },
  ownerBehavior: { type: Number, min: 1, max: 5 },

  // Feedback
  comment: { type: String, maxlength: 1000 },
  ownerReply: { type: String, maxlength: 1000 },

  // System
  createdAt: { type: Date, default: Date.now },
});

// Indexes
reviewSchema.index({ property: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ booking: 1 }, { unique: true }); // 1 review per booking

export const Review = mongoose.model("Review", reviewSchema);
