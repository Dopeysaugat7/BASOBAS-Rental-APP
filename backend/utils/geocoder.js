import NodeGeocoder from "node-geocoder";
import dotenv from "dotenv";
import ErrorHandler from "../middlewares/error.js";

// Load environment variables
dotenv.config();

// In-memory cache
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 1 week cache duration

// Rate limiting variables
let lastRequestTime = 0;
const REQUEST_INTERVAL = 1100; // 1.1 seconds between requests

// Initialize geocoder
const geocoder = NodeGeocoder({
  provider: "openstreetmap",
  httpAdapter: "https",
  osmServer: "https://nominatim.openstreetmap.org",
  email: process.env.GEOCODER_EMAIL || "rohan02shrestha@email.com",
  format: "json",
  timeout: 10000,
});

/**
 * Get cached result if available
 */
function getFromCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  // Check if cache entry is expired
  if (Date.now() > cached.expires) {
    cache.delete(key);
    return null;
  }

  return cached.value;
}

/**
 * Store result in cache
 */
function setToCache(key, value, ttl = CACHE_TTL) {
  cache.set(key, {
    value,
    expires: Date.now() + ttl,
  });
}

/**
 * Generate cache key for geocoding queries
 */
function generateCacheKey(type, query) {
  if (type === "geocode") {
    return `geo:${query.toLowerCase().trim()}`;
  } else {
    return `revgeo:${query.lat.toFixed(6)}:${query.lon.toFixed(6)}`;
  }
}

/**
 * Enforce rate limiting
 */
async function enforceRateLimit() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;

  if (timeSinceLast < REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, REQUEST_INTERVAL - timeSinceLast)
    );
  }

  lastRequestTime = Date.now();
}

// utils/geocoder.js - Enhanced version for Nepal
export const geocodePropertyAddress = async (addressObj) => {
  try {
    if (!addressObj || typeof addressObj !== "object") {
      throw new ErrorHandler("Invalid address object", 400);
    }

    // Validate required fields for Nepal
    if (!addressObj.city || !addressObj.street) {
      throw new ErrorHandler("City and street are required", 400);
    }

    // Create different address variations to try (specific to Nepal)
    const addressVariations = [
      // Full address with postal code
      `${addressObj.street}, ${addressObj.city}, ${
        addressObj.postalCode || ""
      }, Nepal`,

      // Without postal code
      `${addressObj.street}, ${addressObj.city}, Nepal`,

      // Just city and landmark
      `${addressObj.landmark ? addressObj.landmark + ", " : ""}${
        addressObj.city
      }, Nepal`,

      // Just city
      `${addressObj.city}, Nepal`,
    ];

    let location;
    for (const address of addressVariations) {
      try {
        const results = await geocoder.geocode(address);

        if (results?.[0]?.latitude && results?.[0]?.longitude) {
          location = {
            latitude: results[0].latitude,
            longitude: results[0].longitude,
            formattedAddress: results[0].formattedAddress || address,
          };
          break;
        }
      } catch (error) {
        console.warn(`Geocoding attempt failed for: ${address}`, error.message);
      }
    }

    if (!location) {
      throw new ErrorHandler(
        "Could not determine location coordinates. Please check the address.",
        400
      );
    }

    return {
      coordinates: {
        lat: location.latitude,
        lng: location.longitude,
      },
      location: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
      formattedAddress: location.formattedAddress,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error instanceof ErrorHandler
      ? error
      : new ErrorHandler("Address verification service failed", 500);
  }
};
const fallbackGeocode = async (address) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
      }
    );
    return response.data[0]
      ? [
          {
            latitude: parseFloat(response.data[0].lat),
            longitude: parseFloat(response.data[0].lon),
          },
        ]
      : null;
  } catch (error) {
    console.error("Fallback geocoding failed:", error);
    return null;
  }
};

/**
 * Geocode an address (address → coordinates)
 */
export const geocode = async (address) => {
  try {
    if (!address || typeof address !== "string") {
      throw new ErrorHandler("Invalid address", 400);
    }

    const cacheKey = generateCacheKey("geocode", address);

    // Check cache first
    const cached = getFromCache(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Enforce rate limiting
    await enforceRateLimit();

    // Make API request
    const results = await geocoder.geocode(address);

    if (!results || results.length === 0) {
      throw new ErrorHandler("No results found", 404);
    }

    const formattedResult = {
      formattedAddress: results[0].formattedAddress,
      latitude: results[0].latitude,
      longitude: results[0].longitude,
      details: {
        street: results[0].streetName,
        number: results[0].streetNumber,
        city: results[0].city,
        state: results[0].state,
        country: results[0].country,
        postalCode: results[0].zipcode,
      },
      cached: false,
    };

    // Store in cache
    setToCache(cacheKey, formattedResult);

    return formattedResult;
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error instanceof ErrorHandler
      ? error
      : new ErrorHandler("Geocoding service failed", 500);
  }
};

/**
 * Reverse geocode coordinates (coordinates → address)
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    if (isNaN(lat) || isNaN(lng)) {
      throw new ErrorHandler("Invalid coordinates", 400);
    }

    const cacheKey = generateCacheKey("reverse", { lat, lon: lng });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    await enforceRateLimit();

    const results = await geocoder.reverse({ lat, lon: lng });

    if (!results || results.length === 0) {
      throw new ErrorHandler("No results found", 404);
    }

    const formattedResult = {
      formattedAddress: results[0].formattedAddress,
      details: {
        street: results[0].streetName,
        number: results[0].streetNumber,
        city: results[0].city,
        state: results[0].state,
        country: results[0].country,
        postalCode: results[0].zipcode,
      },
      cached: false,
    };

    setToCache(cacheKey, formattedResult);

    return formattedResult;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    throw error instanceof ErrorHandler
      ? error
      : new ErrorHandler("Reverse geocoding service failed", 500);
  }
};

export default {
  geocode,
  reverseGeocode,
  clearCache: () => cache.clear(), // Method to clear cache
  getCacheSize: () => cache.size, // Method to check cache size
};
