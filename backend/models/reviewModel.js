import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
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

// Update updatedAt on save
reviewSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Update property's averageRating after save
reviewSchema.post("save", async function (doc) {
  const Property = mongoose.model("Property");
  const reviews = await mongoose
    .model("Review")
    .find({ property: doc.property });
  const avgRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  await Property.findByIdAndUpdate(doc.property, { averageRating: avgRating });
});

// Update property's averageRating after review removal
reviewSchema.post("remove", async function (doc) {
  const Property = mongoose.model("Property");
  const reviews = await mongoose
    .model("Review")
    .find({ property: doc.property });
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
  await Property.findByIdAndUpdate(doc.property, { averageRating: avgRating });
});

// Indexes for faster queries
reviewSchema.index({ property: 1, user: 1 }, { unique: true });
reviewSchema.index({ property: 1, createdAt: -1 });

export const Review = mongoose.model("Review", reviewSchema);
