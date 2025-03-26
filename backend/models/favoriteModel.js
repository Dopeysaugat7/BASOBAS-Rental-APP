import mongoose from "mongoose";

const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Compound Index (Prevent duplicates)
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", favoriteSchema);
