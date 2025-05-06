import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Review } from "../models/reviewModel.js";
import { Property } from "../models/propertyModel.js";

// Helper function to update property reviews and average rating
const updatePropertyReviews = async (propertyId) => {
  console.log(`Updating reviews for property: ${propertyId}`);
  const reviews = await Review.find({ property: propertyId });
  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ErrorHandler("Property not found", 404);
  }

  property.reviews = reviews.map((review) => review._id);
  property.averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  console.log(`Property reviews array: ${property.reviews}`);
  console.log(`Property averageRating: ${property.averageRating}`);
  await property.save();
  return property;
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
export const createReview = catchAsyncError(async (req, res, next) => {
  const { property, rating, comment } = req.body;

  // Validate input
  if (!property || !rating || !comment) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  try {
    // Check if property exists
    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) {
      throw new ErrorHandler("Property not found", 404);
    }

    // Check if user has already reviewed this property
    const existingReview = await Review.findOne({
      property,
      user: req.user._id,
    });
    if (existingReview) {
      throw new ErrorHandler("You have already reviewed this property", 400);
    }

    // Create review
    const review = await Review.create({
      property,
      user: req.user._id,
      rating,
      comment,
    });

    console.log(`Created review: ${review._id}`);

    // Update property reviews
    await updatePropertyReviews(property);

    // Populate user data
    await review.populate("user", "name profilePicture");

    console.log("Review created successfully");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return next(
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler(error.message || "Failed to create review", 500)
    );
  }
});

// @desc    Get all reviews for a property
// @route   GET /api/reviews/:propertyId
// @access  Public
export const getPropertyReviews = catchAsyncError(async (req, res, next) => {
  const { propertyId } = req.params;
  const { page = 1, limit = 10, sort = "createdAt:-1" } = req.query;

  // Validate property
  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Parse sort parameters
  const [sortField, sortOrder] = sort.split(":");
  const sortObj = { [sortField]: sortOrder === "1" ? 1 : -1 };

  // Get reviews
  const reviews = await Review.find({ property: propertyId })
    .populate("user", "name profilePicture")
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ property: propertyId });

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: reviews,
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment } = req.body;

  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new ErrorHandler("Review not found", 404);
    }

    // Check ownership or property host
    const property = await Property.findById(review.property);
    if (!property) {
      throw new ErrorHandler("Property not found", 404);
    }
    if (
      review.user.toString() !== req.user._id.toString() &&
      property.host.toString() !== req.user._id.toString()
    ) {
      throw new ErrorHandler("Not authorized to update this review", 403);
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();
    console.log(`Updated review: ${review._id}`);

    // Update property reviews
    await updatePropertyReviews(review.property);

    // Populate user data
    await review.populate("user", "name profilePicture");

    console.log("Review updated successfully");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return next(
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler(error.message || "Failed to update review", 500)
    );
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = catchAsyncError(async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new ErrorHandler("Review not found", 404);
    }

    // Check ownership or property host
    const property = await Property.findById(review.property);
    if (!property) {
      throw new ErrorHandler("Property not found", 404);
    }
    if (
      review.user.toString() !== req.user._id.toString() &&
      property.host.toString() !== req.user._id.toString()
    ) {
      throw new ErrorHandler("Not authorized to delete this review", 403);
    }

    // Remove review
    await review.deleteOne();
    console.log(`Deleted review: ${req.params.id}`);

    // Update property reviews
    await updatePropertyReviews(review.property);

    console.log("Review deleted successfully");

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return next(
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler(error.message || "Failed to delete review", 500)
    );
  }
});

// @desc    Get popular reviews for a property (top 3 highest rated)
// @route   GET /api/reviews/:propertyId/popular
// @access  Public
export const getPopularReviews = catchAsyncError(async (req, res, next) => {
  const { propertyId } = req.params;

  // Validate property
  const property = await Property.findById(propertyId);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Get top 3 highest rated reviews
  const reviews = await Review.find({ property: propertyId })
    .populate("user", "name profilePicture")
    .sort({ rating: -1, createdAt: -1 })
    .limit(3);

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});
