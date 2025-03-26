const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new Schema({
  // Basic Property Info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  propertyType: {
    type: String,
    required: true,
    enum: [
      "House",
      "Apartment",
      "Villa",
      "Farmhouse",
      "Cottage",
      "Penthouse",
      "Duplex",
      "Studio",
    ],
  },

  // BHK & Property Structure
  bhkConfiguration: {
    bedrooms: {
      type: Number,
      required: true,
      min: 1,
    },
    halls: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    kitchens: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1,
  },
  builtUpArea: {
    type: Number,
    required: true,
    min: 1,
  }, // in sq.ft
  carpetArea: {
    type: Number,
    min: 1,
  }, // in sq.ft
  furnishingStatus: {
    type: String,
    enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
    default: "Unfurnished",
  },
  floor: {
    type: Number,
  }, // 0 = Ground floor
  totalFloors: {
    type: Number,
  }, // Total floors in building

  // Rental Details
  maxGuests: {
    type: Number,
    required: true,
    min: 1,
  },
  pricePerMonth: {
    type: Number,
    required: true,
    min: 0,
  }, // Monthly rent
  pricePerDay: {
    type: Number,
    min: 0,
  }, // Optional daily rate
  securityDeposit: {
    type: Number,
    default: 0,
    min: 0,
  },
  maintenanceFee: {
    type: Number,
    default: 0,
  }, // Monthly maintenance (if any)

  // Amenities
  amenities: [
    {
      type: String,
      enum: [
        "Wifi",
        "Air Conditioning",
        "Heating",
        "TV",
        "Washing Machine",
        "Parking",
        "Elevator",
        "Power Backup",
        "Swimming Pool",
        "Gym",
        "Garden",
        "Balcony",
        "Pet-Friendly",
        "Security",
        "CCTV",
        "Modular Kitchen",
        "Fridge",
        "Microwave",
        "Geyser",
        "RO Water",
      ],
    },
  ],

  // Location & Address
  address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    landmark: {
      type: String,
    }, // Optional
  },

  // Property Rules
  houseRules: {
    petsAllowed: {
      type: Boolean,
      default: false,
    },
    smokingAllowed: {
      type: Boolean,
      default: false,
    },
    eventsAllowed: {
      type: Boolean,
      default: false,
    },
    extraRules: {
      type: String,
      maxlength: 500,
    }, // Custom rules
  },

  // Availability & Booking
  isAvailable: {
    type: Boolean,
    default: true,
  },
  availableFrom: {
    type: Date,
  }, // When property is ready for move-in
  minimumStayMonths: {
    type: Number,
    default: 1,
  }, // Min rental duration

  // Images
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      isPrimary: {
        type: Boolean,
        default: false,
      },
      caption: {
        type: String,
        maxlength: 100,
      },
    },
  ],

  // Host/Owner Info
  host: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Stats & Metadata
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  }, // Track property views
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// Update 'updatedAt' on save
propertySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for faster queries
propertySchema.index({ host: 1 });
propertySchema.index({ "address.city": 1 });
propertySchema.index({ "address.coordinates": "2dsphere" });
propertySchema.index({ pricePerMonth: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ "bhkConfiguration.bedrooms": 1 }); // For BHK-based searches

export const Property = mongoose.model("Property", propertySchema);
