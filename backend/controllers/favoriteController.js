import { Property } from "../models/propertyModel.js";
import { User } from "../models/userModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";

// @desc    Add property to favorites
// @route   POST /api/favorites/:propertyId
// @access  Private
export const addToFavorites = catchAsyncError(async (req, res, next) => {
  const { propertyId } = req.params;
  const userId = req.user._id;

  // Check if property exists
  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Check if already favorited
  const user = await User.findById(userId);
  if (user.favorites.includes(propertyId)) {
    return next(new ErrorHandler("Property already in favorites", 400));
  }

  // Add to favorites
  await User.findByIdAndUpdate(userId, {
    $addToSet: { favorites: propertyId },
  });

  res.status(200).json({
    success: true,
    message: "Property added to favorites",
  });
});

// @desc    Remove property from favorites
// @route   DELETE /api/favorites/:propertyId
// @access  Private
export const removeFromFavorites = catchAsyncError(async (req, res, next) => {
  const { propertyId } = req.params;
  const userId = req.user._id;

  // Remove from favorites
  await User.findByIdAndUpdate(userId, {
    $pull: { favorites: propertyId },
  });

  res.status(200).json({
    success: true,
    message: "Property removed from favorites",
  });
});

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
export const getFavorites = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate({
    path: "favorites",
    select: "title images address pricePerMonth",
  });

  res.status(200).json({
    success: true,
    favorites: user.favorites,
  });
});

// @desc    Check if property is favorited
// @route   GET /api/favorites/:propertyId/status
// @access  Private
export const checkFavoriteStatus = catchAsyncError(async (req, res, next) => {
  const { propertyId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  const isFavorited = user.favorites.includes(propertyId);

  res.status(200).json({
    success: true,
    isFavorited,
  });
});
