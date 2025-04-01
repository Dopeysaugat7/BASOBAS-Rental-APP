import { Property } from "../models/propertyModel.js";
import { User } from "../models/userModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import geocoder, { geocodePropertyAddress } from "../utils/geocoder.js";
import { Visit } from "../models/visitModel.js";

export const createProperty = catchAsyncError(async (req, res, next) => {
  // Parse nested objects if they're strings (from form-data)
  const parsedData = {
    ...req.body,
    host: req.user._id,
    bhkConfiguration:
      typeof req.body.bhkConfiguration === "string"
        ? JSON.parse(req.body.bhkConfiguration)
        : req.body.bhkConfiguration,
    address:
      typeof req.body.address === "string"
        ? JSON.parse(req.body.address)
        : req.body.address,
    amenities:
      typeof req.body.amenities === "string"
        ? JSON.parse(req.body.amenities)
        : req.body.amenities || [],
    houseRules:
      typeof req.body.houseRules === "string"
        ? JSON.parse(req.body.houseRules)
        : req.body.houseRules || {},
  };

  // Validate required address fields for Nepal
  if (!parsedData.address?.city || !parsedData.address?.street) {
    return next(
      new ErrorHandler("City and street are required in address", 400)
    );
  }

  // Set default country to Nepal if not provided
  if (!parsedData.address.country) {
    parsedData.address.country = "Nepal";
  }

  // Calculate total rooms
  if (parsedData.bhkConfiguration) {
    parsedData.totalRooms =
      parsedData.bhkConfiguration.bedrooms +
      parsedData.bhkConfiguration.halls +
      parsedData.bhkConfiguration.kitchens +
      parsedData.bhkConfiguration.bathrooms;
  }

  // Geocode the address if coordinates aren't provided
  if (parsedData.address && !parsedData.address.coordinates) {
    try {
      const geocoded = await geocodePropertyAddress(parsedData.address);
      parsedData.address = {
        ...parsedData.address,
        ...geocoded,
      };
    } catch (error) {
      return next(error);
    }
  }

  // Rest of your controller remains the same...
  const property = await Property.create({
    ...parsedData,
    images:
      req.files?.map((file) => ({
        url: `/uploads/properties/${file.filename}`,
        isPrimary: false,
      })) || [],
  });

  if (property.images.length > 0) {
    property.images[0].isPrimary = true;
    await property.save();
  }

  await User.findByIdAndUpdate(req.user._id, {
    $push: { properties: property._id },
  });

  res.status(201).json({
    success: true,
    property,
  });
});

// export const uploadImages = catchAsyncError(async (req, res, next) => {
//   const property = await Property.findById(req.params.id);
//   if (!property) {
//     return next(new ErrorHandler("Property not found", 404));
//   }

//   // Check ownership
//   if (property.host.toString() !== req.user._id.toString()) {
//     return next(
//       new ErrorHandler("Not authorized to update this property", 403)
//     );
//   }

//   // Process uploaded files
//   const imageUrls = req.files.map((file) => ({
//     url: `/uploads/properties/${file.filename}`,
//     isPrimary: property.images.length === 0, // Set as primary if first image
//   }));

//   // Add new images to property
//   property.images.push(...imageUrls);
//   await property.save();

//   res.status(200).json({
//     success: true,
//     message: "Images uploaded successfully",
//     images: imageUrls,
//   });
// });

// @desc    Approve/reject property (Admin only)
// @route   PUT /api/properties/:id/approve
// @access  Private/Admin
export const approveProperty = catchAsyncError(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  if (!["approved", "rejected"].includes(status)) {
    return next(new ErrorHandler("Invalid status", 400));
  }

  property.approvalStatus = status;
  property.approvedBy = req.user._id;
  property.approvedAt = new Date();

  if (status === "rejected") {
    property.rejectionReason = rejectionReason || "No reason provided";
    property.isActive = false;
  } else {
    property.isActive = true;
    property.rejectionReason = undefined;
  }

  await property.save();

  res.status(200).json({
    success: true,
    message: `Property ${status} successfully`,
    property,
  });
});

// @desc    Extend property expiry
// @route   PUT /api/properties/:id/extend
// @access  Private
export const extendPropertyExpiry = catchAsyncError(async (req, res, next) => {
  const { months } = req.body;
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Check ownership
  if (property.host.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("Not authorized to update this property", 403)
    );
  }

  const extensionMonths = parseInt(months) || 12; // Default to 1 year
  const newExpiryDate = new Date(
    property.expiryDate.getTime() + extensionMonths * 30 * 24 * 60 * 60 * 1000
  );

  property.expiryDate = newExpiryDate;
  property.isExpired = false;
  property.isAvailable = true;
  await property.save();

  res.status(200).json({
    success: true,
    message: `Property expiry extended by ${extensionMonths} months`,
    newExpiryDate,
    property,
  });
});

// @desc    Get all properties with filtering
// @route   GET /api/properties
// @access  Public/Private
export const getAllProperties = catchAsyncError(async (req, res, next) => {
  // 1) Basic filtering
  const queryObj = { ...req.query };
  const excludedFields = [
    "page",
    "sort",
    "limit",
    "fields",
    "search",
    "near",
    "myProperties",
  ];
  excludedFields.forEach((el) => delete queryObj[el]);

  // 2) Apply default filters for everyone
  queryObj.isExpired = false;
  queryObj.isActive = true;

  // 3) Special case: If user wants to see their own properties
  if (req.query.myProperties && req.user) {
    queryObj.host = req.user._id;
    delete queryObj.isAvailable; // Show all their properties regardless of availability
  }
  // Normal case: Show available properties to everyone
  else {
    queryObj.isAvailable = true;
  }

  // 4) Advanced filtering for ranges
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  let query = Property.find(JSON.parse(queryStr));

  // 5) Search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    query = query.or([
      { title: searchRegex },
      { description: searchRegex },
      { "address.city": searchRegex },
      { "address.street": searchRegex },
      { "address.landmark": searchRegex },
    ]);
  }

  // 6) Location-based search
  if (req.query.near) {
    const [lat, lng, radius] = req.query.near.split(",");
    if (!lat || !lng || !radius) {
      return next(
        new AppError("Please provide lat,lng,radius in near parameter", 400)
      );
    }

    query = query.where("address.location").near({
      center: [parseFloat(lng), parseFloat(lat)],
      spherical: true,
      maxDistance: parseFloat(radius) * 1000,
    });
  }

  // 7) Populate host information
  query = query.populate("host", "name email phone profilePicture");

  // 8) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    // Default sorting: newest first, but prioritize user's own properties
    if (req.query.myProperties && req.user) {
      query = query.sort("-createdAt");
    } else {
      query = query.sort("-createdAt");
    }
  }

  // 9) Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // 10) Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // 11) Execute query
  const properties = await query;
  const total = await Property.countDocuments(query.getFilter());

  res.status(200).json({
    success: true,
    count: properties.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: properties,
  });
});

// @desc    Get expired properties
// @route   GET /api/properties/expired
// @access  Private
export const getExpiredProperties = catchAsyncError(async (req, res, next) => {
  // For hosts, only show their own expired properties
  // For admins, show all expired properties
  const query = { isExpired: true };
  if (!req.user.isAdmin) {
    query.host = req.user._id;
  }

  const properties = await Property.find(query)
    .populate("host", "name email phone profilePicture")
    .sort("-expiryDate");

  res.status(200).json({
    success: true,
    count: properties.length,
    results: properties,
  });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
export const updateProperty = catchAsyncError(async (req, res, next) => {
  let property = await Property.findById(req.params.id);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Check ownership
  if (property.host.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("Not authorized to update this property", 403)
    );
  }

  // Parse nested objects from FormData
  const parsedBody = {
    ...req.body,
    ...(req.body.bhkConfiguration && {
      bhkConfiguration: JSON.parse(req.body.bhkConfiguration),
    }),
    ...(req.body.address && {
      address: JSON.parse(req.body.address),
    }),
    ...(req.body.houseRules && {
      houseRules: JSON.parse(req.body.houseRules),
    }),
    ...(req.body.amenities && {
      amenities: JSON.parse(req.body.amenities),
    }),
  };

  // Handle image uploads if any
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: `/uploads/properties/${file.filename}`,
      isPrimary: false,
    }));

    parsedBody.images = [...property.images, ...newImages];
  }

  // Update the property
  property = await Property.findByIdAndUpdate(req.params.id, parsedBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Property updated successfully",
    property,
  });
});

// // Helper function to determine if reapproval is needed
// function shouldRequireReapproval(newData, existingProperty) {
//   const significantFields = [
//     "propertyType",
//     "bhkConfiguration",
//     "builtUpArea",
//     "furnishingStatus",
//     "address",
//   ];

//   return significantFields.some((field) => {
//     if (field === "bhkConfiguration" || field === "address") {
//       return (
//         JSON.stringify(newData[field]) !==
//         JSON.stringify(existingProperty[field])
//       );
//     }
//     return newData[field] && newData[field] !== existingProperty[field];
//   });
// }

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private
export const deleteProperty = catchAsyncError(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Check ownership or admin status
  if (
    property.host.toString() !== req.user._id.toString() &&
    !req.user.isAdmin
  ) {
    return next(
      new ErrorHandler("Not authorized to delete this property", 403)
    );
  }

  // Delete associated images from server
  if (property.images && property.images.length > 0) {
    const uploadDir = path.join(
      process.cwd(),
      "../frontend/uploads/properties"
    );
    property.images.forEach((image) => {
      const imagePath = path.join(uploadDir, path.basename(image.url));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
  }

  console.log("property.host:", property);
  // Remove property reference from user
  await User.findByIdAndUpdate(property.host, {
    $pull: { properties: property._id },
  });

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: "Property deleted successfully",
  });
});

// @desc    Get properties near a location
// @route   GET /api/properties/near/:zipcode/:distance
// @access  Public
export const getPropertiesNearLocation = catchAsyncError(
  async (req, res, next) => {
    const { zipcode, distance } = req.params;

    try {
      // 1. Geocode the location
      const geocodeResult = await geocoder.geocode(zipcode);
      console.log("Geocode result:", geocodeResult); // Debug log

      if (!geocodeResult?.latitude || !geocodeResult?.longitude) {
        return next(
          new ErrorHandler(
            "Could not determine coordinates for this location",
            400
          )
        );
      }

      const { latitude, longitude } = geocodeResult;
      const radiusKm = parseFloat(distance);

      // 2. Debug: Check database contents
      const sampleProperties = await Property.find().limit(2);
      console.log(
        "Sample properties:",
        sampleProperties.map((p) => ({
          title: p.title,
          coordinates: p.address.coordinates,
        }))
      );

      // 3. Convert to proper query format
      const radiusInRadians = radiusKm / 6378;

      // OPTION 1: Using $expr (works with your {lat, lng} schema)
      const properties = await Property.find({
        $expr: {
          $let: {
            vars: {
              dist: {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        {
                          $sin: {
                            $degreesToRadians: "$address.coordinates.lat",
                          },
                        },
                        { $sin: { $degreesToRadians: latitude } },
                      ],
                    },
                    {
                      $multiply: [
                        {
                          $cos: {
                            $degreesToRadians: "$address.coordinates.lat",
                          },
                        },
                        { $cos: { $degreesToRadians: latitude } },
                        {
                          $cos: {
                            $subtract: [
                              { $degreesToRadians: "$address.coordinates.lng" },
                              { $degreesToRadians: longitude },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            },
            in: { $lte: ["$$dist", radiusInRadians] },
          },
        },
      }).populate("host", "name email phone profilePicture");
      // .populate({
      //   path: "reviews",
      //   populate: { path: "user", select: "name profilePicture" },
      // });

      // OPTION 2: Alternative if you can modify your schema
      // Add a GeoJSON-compatible field to your schema:
      // location: { type: { type: String, default: 'Point' }, coordinates: [Number] }
      // Then create 2dsphere index on this field

      res.status(200).json({
        success: true,
        count: properties.length,
        center: { latitude, longitude },
        radius: radiusKm,
        unit: "km",
        debug: {
          // Added debug info
          searchLocation: { latitude, longitude },
          sampleProperties: sampleProperties.map((p) => p.address.coordinates),
        },
        data: properties,
      });
    } catch (error) {
      console.error("Error in getPropertiesNearLocation:", error);
      return next(new ErrorHandler("Failed to find nearby properties", 500));
    }
  }
);

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getProperty = catchAsyncError(async (req, res, next) => {
  console.log(req.params.id);
  const property = await Property.findById(req.params.id).populate(
    "host",
    "name email phone profilePicture"
  );
  // .populate({
  //   path: "reviews",
  //   populate: {
  //     path: "user",
  //     select: "name profilePicture",
  //   },
  // });

  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Increment view count
  property.views += 1;
  await property.save();

  res.status(200).json({
    success: true,
    property,
  });
});

// @desc    Upload property images
// @route   PUT /api/properties/:id/images
// @access  Private
export const uploadImages = catchAsyncError(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Check ownership
  if (property.host.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("Not authorized to update this property", 403)
    );
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorHandler("No images uploaded", 400));
  }

  // Process uploaded files
  const newImages = req.files.map((file) => ({
    url: `/uploads/properties/${file.filename}`,
    isPrimary: false,
  }));

  // Add new images to property
  property.images.push(...newImages);

  // If this is the first image, set it as primary
  if (property.images.length === newImages.length) {
    property.images[0].isPrimary = true;
  }

  await property.save();

  res.status(200).json({
    success: true,
    message: "Images uploaded successfully",
    images: newImages,
  });
});

// @desc    Set primary image
// @route   PUT /api/properties/:id/primary-image
// @access  Private
export const setPrimaryImage = catchAsyncError(async (req, res, next) => {
  const { imageId } = req.body;
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Check ownership
  if (property.host.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("Not authorized to update this property", 403)
    );
  }

  // Find the image to set as primary
  const imageToSet = property.images.find(
    (img) => img._id.toString() === imageId
  );
  if (!imageToSet) {
    return next(new ErrorHandler("Image not found in property", 404));
  }

  // Reset all images to non-primary
  property.images.forEach((img) => {
    img.isPrimary = false;
  });

  // Set the selected image as primary
  imageToSet.isPrimary = true;
  await property.save();

  res.status(200).json({
    success: true,
    message: "Primary image set successfully",
    property,
  });
});

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private
export const deleteImage = catchAsyncError(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return next(new ErrorHandler("Property not found", 404));
  }

  // Check ownership
  if (property.host.toString() !== req.user._id.toString()) {
    return next(
      new ErrorHandler("Not authorized to update this property", 403)
    );
  }

  // Find the image to delete
  const imageIndex = property.images.findIndex(
    (img) => img._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) {
    return next(new ErrorHandler("Image not found", 404));
  }

  const imageToDelete = property.images[imageIndex];

  // Don't allow deleting if it's the only image
  if (property.images.length === 1) {
    return next(
      new ErrorHandler("Cannot delete the only image of a property", 400)
    );
  }

  // Delete image file from server
  const uploadDir = path.join(process.cwd(), "../frontend/uploads/properties");
  const imagePath = path.join(uploadDir, path.basename(imageToDelete.url));
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  // Remove image from array
  property.images.splice(imageIndex, 1);

  // If we deleted the primary image, set the first remaining image as primary
  if (imageToDelete.isPrimary && property.images.length > 0) {
    property.images[0].isPrimary = true;
  }

  await property.save();

  res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    property,
  });
});

// @desc    Get properties by host/user
// @route   GET /api/properties/host/:userId
// @access  Public
export const getPropertiesByHost = catchAsyncError(async (req, res, next) => {
  console.log(req.params.userId);
  const properties = await Property.find({ host: req.params.userId }).populate(
    "host",
    "name email phone profilePicture"
  );

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

export const getPropertyVisits = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Verify the requesting user is the host
    if (property.host.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const visits = await Visit.find({ property: req.params.propertyId })
      .sort({
        visitDate: -1,
      })
      .populate("property", "title address");

    res.json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({ error: "Failed to fetch visits" });
  }
};
